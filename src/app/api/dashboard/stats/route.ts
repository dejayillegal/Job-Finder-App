import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/database';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = getDatabase();

    // Get resume count
    const resumeCount = db.prepare(
      'SELECT COUNT(*) as count FROM resumes WHERE user_id = ?'
    ).get(user.id) as { count: number };

    // Get application count
    const applicationCount = db.prepare(
      'SELECT COUNT(*) as count FROM applications WHERE user_id = ?'
    ).get(user.id) as { count: number };

    // Get average ATS score
    const avgScore = db.prepare(
      'SELECT AVG(ats_score) as avg FROM resumes WHERE user_id = ? AND ats_score IS NOT NULL'
    ).get(user.id) as { avg: number | null };

    // Get applications by status
    const applicationsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM applications
      WHERE user_id = ?
      GROUP BY status
    `).all(user.id) as Array<{ status: string; count: number }>;

    return NextResponse.json({
      resumes: resumeCount.count,
      applications: applicationCount.count,
      avgAtsScore: Math.round(avgScore.avg || 0),
      applicationsByStatus
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
