import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase, type Resume } from '@/lib/database';

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
    const resumes = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC')
      .all(user.id) as Resume[];

    return NextResponse.json({ resumes });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}
