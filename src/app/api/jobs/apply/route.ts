import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { jobId, resumeId } = await request.json();

    if (!jobId || !resumeId) {
      return NextResponse.json(
        { error: 'Job ID and Resume ID are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if already applied
    const existing = db.prepare(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?'
    ).get(user.id, jobId);

    if (existing) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const stmt = db.prepare(`
      INSERT INTO applications (user_id, job_id, resume_id, status)
      VALUES (?, ?, ?, 'pending')
    `);

    const result = stmt.run(user.id, jobId, resumeId);

    return NextResponse.json({
      success: true,
      applicationId: result.lastInsertRowid
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply to job' },
      { status: 500 }
    );
  }
}
