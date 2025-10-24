import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database-v2';
import { getCurrentUser, logActivity } from '@/lib/enhanced-auth';
import { parseResumeFile, parseEnhancedResumeData } from '@/lib/enhanced-resume-parser';
import { calculateEnhancedATSScore } from '@/lib/enhanced-ats-scorer';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.' }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Parse the resume file
    const buffer = Buffer.from(await file.arrayBuffer());
    const content = await parseResumeFile(buffer, file.name);

    // Extract structured data
    const parsedData = parseEnhancedResumeData(content);

    // Calculate enhanced ATS score
    const atsScore = calculateEnhancedATSScore(content, parsedData);

    const db = getDatabase();

    // Deactivate previous resumes
    db.prepare('UPDATE resumes SET is_active = 0 WHERE user_id = ?').run(user.id);

    // Insert new resume
    const insertResume = db.prepare(`
      INSERT INTO resumes (
        user_id, filename, original_filename, file_size, content, parsed_data, 
        ats_score, ats_breakdown, work_experience_years, extracted_skills, 
        extracted_experience, extracted_education, analysis_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const resumeResult = insertResume.run(
      user.id,
      `resume_${Date.now()}_${file.name}`,
      file.name,
      file.size,
      content,
      JSON.stringify(parsedData),
      atsScore.overall,
      JSON.stringify(atsScore.breakdown),
      parsedData.experience,
      JSON.stringify(parsedData.skills),
      JSON.stringify(parsedData.workHistory),
      JSON.stringify(parsedData.education)
    );

    // Update user skills
    if (parsedData.skills && parsedData.skills.length > 0) {
      // Clear existing skills
      db.prepare('DELETE FROM user_skills WHERE user_id = ?').run(user.id);

      // Insert new skills
      const insertSkill = db.prepare(`
        INSERT INTO user_skills (user_id, skill_name, proficiency_level, years_experience)
        VALUES (?, ?, ?, ?)
      `);

      parsedData.skills.forEach((skill: string, index: number) => {
        const proficiency = Math.min(5, Math.max(1, 5 - Math.floor(index / 5))); // Decreasing proficiency
        const experience = Math.min(parsedData.experience, Math.floor(parsedData.experience * 0.8));
        insertSkill.run(user.id, skill, proficiency, experience);
      });
    }

    // Generate job matches for this user
    await generateJobMatches(user.id, parsedData);

    // Log the activity
    logActivity(user.id, 'resume_uploaded', 'resume', resumeResult.lastInsertRowid as number, {
      filename: file.name,
      atsScore: atsScore.overall,
      skillsCount: parsedData.skills?.length || 0
    }, request);

    return NextResponse.json({
      success: true,
      resume: {
        id: resumeResult.lastInsertRowid,
        filename: file.name,
        atsScore: atsScore.overall,
        breakdown: atsScore.breakdown,
        recommendations: atsScore.recommendations,
        strengths: atsScore.strengths,
        improvements: atsScore.improvements,
        extractedData: {
          skills: parsedData.skills,
          experience: parsedData.experience,
          workHistory: parsedData.workHistory,
          education: parsedData.education,
          contactInfo: {
            email: parsedData.email,
            phone: parsedData.phone,
            location: parsedData.location
          }
        }
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload and analyze resume' },
      { status: 500 }
    );
  }
}

async function generateJobMatches(userId: number, parsedData: any) {
  const db = getDatabase();

  // Get all active jobs
  const jobs = db.prepare('SELECT * FROM jobs WHERE status = "active"').all();

  // Calculate match scores
  const insertMatch = db.prepare(`
    INSERT OR REPLACE INTO job_matches (
      user_id, job_id, match_score, skills_match_count, 
      salary_match, location_match, experience_match, recommended
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  jobs.forEach((job: any) => {
    const matchScore = calculateJobMatchScore(job, parsedData);
    const recommended = matchScore.overall >= 70;

    insertMatch.run(
      userId,
      job.id,
      matchScore.overall,
      matchScore.skillsMatch,
      matchScore.salaryMatch ? 1 : 0,
      matchScore.locationMatch ? 1 : 0,
      matchScore.experienceMatch ? 1 : 0,
      recommended ? 1 : 0
    );
  });
}

function calculateJobMatchScore(job: any, parsedData: any): {
  overall: number;
  skillsMatch: number;
  salaryMatch: boolean;
  locationMatch: boolean;
  experienceMatch: boolean;
} {
  let score = 0;

  // Skills matching (40% weight)
  const userSkills = parsedData.skills || [];
  const jobSkills = job.skills_required ? JSON.parse(job.skills_required) : [];

  const skillMatches = userSkills.filter((skill: string) =>
    jobSkills.some((jobSkill: string) => 
      skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  const skillsScore = Math.min((skillMatches.length / Math.max(jobSkills.length, 1)) * 40, 40);
  score += skillsScore;

  // Experience matching (25% weight)
  const userExp = parsedData.experience || 0;
  const jobExpRequired = job.experience_required || '';
  const expMatch = calculateExperienceMatch(userExp, jobExpRequired);
  score += expMatch * 25;

  // Location matching (20% weight)
  const userLocation = parsedData.location || '';
  const jobLocation = job.location || '';
  const locationMatch = calculateLocationMatch(userLocation, jobLocation, job.remote);
  score += locationMatch * 20;

  // Salary matching (15% weight)
  const salaryMatch = true; // Simplified for now
  score += salaryMatch ? 15 : 0;

  return {
    overall: Math.round(score),
    skillsMatch: skillMatches.length,
    salaryMatch,
    locationMatch: locationMatch > 0.5,
    experienceMatch: expMatch > 0.5
  };
}

function calculateExperienceMatch(userExp: number, jobExp: string): number {
  if (!jobExp) return 0.8;

  const expPattern = /(\d+)[-\+\s]*(\d+)?/;
  const match = jobExp.match(expPattern);

  if (!match) return 0.5;

  const minReq = parseInt(match[1]);
  const maxReq = match[2] ? parseInt(match[2]) : minReq + 3;

  if (userExp >= minReq && userExp <= maxReq + 2) return 1.0;
  if (userExp >= minReq - 1) return 0.8;
  return 0.4;
}

function calculateLocationMatch(userLoc: string, jobLoc: string, remote: boolean): number {
  if (remote) return 0.9;
  if (!userLoc || !jobLoc) return 0.5;

  const userL = userLoc.toLowerCase();
  const jobL = jobLoc.toLowerCase();

  if (userL.includes(jobL) || jobL.includes(userL)) return 1.0;
  if ((userL.includes('bangalore') && jobL.includes('bangalore')) ||
      (userL.includes('mumbai') && jobL.includes('mumbai'))) return 1.0;

  return 0.4;
}