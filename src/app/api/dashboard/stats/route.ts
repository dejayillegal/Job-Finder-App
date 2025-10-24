import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database-v2';
import { getCurrentUser } from '@/lib/enhanced-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDatabase();

    // Get resume count and latest ATS score
    const resumeStats = db.prepare(`
      SELECT COUNT(*) as count, MAX(ats_score) as maxAtsScore, AVG(ats_score) as avgAtsScore
      FROM resumes WHERE user_id = ?
    `).get(user.id) as { count: number; maxAtsScore: number; avgAtsScore: number };

    // Get application statistics
    const applicationStats = db.prepare(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN status = 'applied' THEN 1 END) as applied,
             COUNT(CASE WHEN status = 'interview' THEN 1 END) as interviews,
             COUNT(CASE WHEN status = 'hired' THEN 1 END) as hired,
             COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM applications WHERE user_id = ?
    `).get(user.id) as any;

    // Get job matches and recommendations
    const jobMatchStats = db.prepare(`
      SELECT COUNT(*) as totalMatches,
             COUNT(CASE WHEN recommended = 1 THEN 1 END) as recommended,
             AVG(match_score) as avgMatchScore,
             MAX(match_score) as bestMatchScore
      FROM job_matches WHERE user_id = ?
    `).get(user.id) as any;

    // Get recent activity
    const recentJobs = db.prepare(`
      SELECT j.id, j.title, j.company, j.location, j.salary_max, j.posted_date,
             jm.match_score, jm.recommended
      FROM jobs j
      JOIN job_matches jm ON j.id = jm.job_id
      WHERE jm.user_id = ? AND j.status = 'active'
      ORDER BY jm.match_score DESC, j.posted_date DESC
      LIMIT 5
    `).all(user.id);

    // Get weekly application trend
    const weeklyStats = db.prepare(`
      SELECT DATE(applied_at) as date, COUNT(*) as count
      FROM applications 
      WHERE user_id = ? AND applied_at >= datetime('now', '-7 days')
      GROUP BY DATE(applied_at)
      ORDER BY date DESC
    `).all(user.id);

    // Get skills analysis
    const skillsStats = db.prepare(`
      SELECT skill_name, proficiency_level, years_experience
      FROM user_skills 
      WHERE user_id = ?
      ORDER BY proficiency_level DESC, years_experience DESC
      LIMIT 10
    `).all(user.id);

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(user, resumeStats.count, skillsStats.length);

    return NextResponse.json({
      profile: {
        completion: profileCompletion,
        name: user.name,
        email: user.email,
        location: user.location
      },
      resumes: {
        count: resumeStats.count,
        latestAtsScore: resumeStats.maxAtsScore || 0,
        averageAtsScore: Math.round(resumeStats.avgAtsScore || 0)
      },
      applications: {
        total: applicationStats.total,
        byStatus: {
          applied: applicationStats.applied,
          interview: applicationStats.interviews,
          hired: applicationStats.hired,
          rejected: applicationStats.rejected
        }
      },
      jobMatches: {
        totalMatches: jobMatchStats.totalMatches || 0,
        recommended: jobMatchStats.recommended || 0,
        averageMatchScore: Math.round(jobMatchStats.avgMatchScore || 0),
        bestMatchScore: Math.round(jobMatchStats.bestMatchScore || 0)
      },
      recentJobs,
      weeklyApplications: weeklyStats,
      topSkills: skillsStats,
      insights: generateInsights(resumeStats, applicationStats, jobMatchStats)
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}

function calculateProfileCompletion(user: any, resumeCount: number, skillsCount: number): number {
  let completion = 0;

  // Basic info (40%)
  if (user.name) completion += 10;
  if (user.email) completion += 10;
  if (user.phone) completion += 10;
  if (user.location) completion += 10;

  // Resume (30%)
  if (resumeCount > 0) completion += 30;

  // Skills (20%)
  if (skillsCount >= 5) completion += 20;
  else if (skillsCount > 0) completion += (skillsCount / 5) * 20;

  // Preferences (10%)
  if (user.preferred_salary_min && user.preferred_salary_max) completion += 5;
  if (user.work_preference) completion += 5;

  return Math.round(completion);
}

function generateInsights(resumeStats: any, applicationStats: any, jobMatchStats: any): string[] {
  const insights: string[] = [];

  if (resumeStats.maxAtsScore >= 85) {
    insights.push('Excellent ATS score! Your resume is highly optimized.');
  } else if (resumeStats.maxAtsScore >= 70) {
    insights.push('Good ATS score. Consider minor improvements for better results.');
  } else if (resumeStats.maxAtsScore > 0) {
    insights.push('ATS score needs improvement. Review recommendations to enhance your resume.');
  }

  if (jobMatchStats.recommended >= 10) {
    insights.push(`${jobMatchStats.recommended} jobs match your profile perfectly.`);
  } else if (jobMatchStats.recommended > 0) {
    insights.push(`${jobMatchStats.recommended} recommended jobs available.`);
  }

  if (applicationStats.total === 0) {
    insights.push('Start applying to jobs that match your skills and experience.');
  } else if (applicationStats.interviews > 0) {
    insights.push(`${applicationStats.interviews} interviews scheduled. Great progress!`);
  }

  const applicationRate = applicationStats.total > 0 ? (applicationStats.interviews / applicationStats.total) * 100 : 0;
  if (applicationRate >= 20) {
    insights.push('High interview conversion rate. Your applications are effective.');
  }

  return insights;
}