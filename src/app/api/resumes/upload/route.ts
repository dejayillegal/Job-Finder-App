import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/database';
import { parseResumeFile, parseResumeData } from '@/lib/resume-parser';
import { calculateATSScore } from '@/lib/ats-scorer';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Parse resume
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await parseResumeFile(buffer, file.name);
    const parsedData = parseResumeData(text);

    // Calculate ATS score
    const atsScore = calculateATSScore(text, parsedData);

    // Save to database
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO resumes (user_id, filename, content, parsed_data, ats_score)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      user.id,
      file.name,
      text,
      JSON.stringify(parsedData),
      atsScore.overall
    );

    return NextResponse.json({
      success: true,
      resumeId: result.lastInsertRowid,
      atsScore,
      parsedData
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
