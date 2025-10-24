import { NextResponse } from 'next/server';
import { getDatabase, type Job } from '@/lib/database';

export async function GET() {
  try {
    const db = getDatabase();
    const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50')
      .all() as Job[];

    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
