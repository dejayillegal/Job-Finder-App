import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const db = getDatabase();
    const jobs = db.prepare(\`
      SELECT * FROM jobs 
      WHERE user_id = ? 
      ORDER BY match_score DESC, scraped_at DESC
      LIMIT 50
    \`).all(parseInt(userId));

    const processed = jobs.map((job: any) => ({
      ...job,
      remote: Boolean(job.remote),
      skills_required: job.skills_required ? JSON.parse(job.skills_required) : []
    }));

    return NextResponse.json({
      success: true,
      jobs: processed,
      count: processed.length
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}