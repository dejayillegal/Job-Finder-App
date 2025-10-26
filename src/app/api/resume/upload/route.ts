import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { parseResume } from '@/lib/resume-parser';
import { scrapeJobsForUser } from '@/lib/job-scraper';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const userId = parseInt(formData.get('userId') as string);

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId required' }, { status: 400 });
    }

    // Parse resume
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResume(buffer, file.name);

    // Save resume to database
    const db = getDatabase();
    // FIXED: Use regular quotes instead of template literals
    const result = db.prepare(`
      INSERT INTO resumes (user_id, filename, content, parsed_data, skills, experience_years, current_role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      file.name,
      parsed.rawText,
      JSON.stringify(parsed),
      parsed.skills.join(', '),
      parsed.experienceYears,
      parsed.currentRole
    );

    // AUTOMATICALLY scrape jobs based on resume
    console.log('🚀 Triggering automatic job scraping...');
    const jobs = await scrapeJobsForUser(userId, parsed.skills, parsed.experienceYears);

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and jobs fetched automatically',
      resume: {
        id: result.lastInsertRowid,
        skills: parsed.skills,
        experienceYears: parsed.experienceYears,
        currentRole: parsed.currentRole
      },
      jobsMatched: jobs.length
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process resume', details: (error as Error).message },
      { status: 500 }
    );
  }
}
