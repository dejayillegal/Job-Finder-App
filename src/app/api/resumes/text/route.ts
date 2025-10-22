/**
 * API Route: /api/resumes/text
 * Returns all extracted resume texts from data/resume_texts.json
 * 
 * No env vars needed
 */
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

const RESUME_TEXTS_FILE = path.join(process.cwd(), 'data', 'resume_texts.json')

export async function GET() {
  try {
    if (!fs.existsSync(RESUME_TEXTS_FILE)) {
      return NextResponse.json({ texts: [] })
    }

    const data = JSON.parse(fs.readFileSync(RESUME_TEXTS_FILE, 'utf-8'))
    return NextResponse.json({ texts: data.texts || [] })
  } catch (error) {
    console.error('Error reading resume texts:', error)
    return NextResponse.json({ texts: [] })
  }
}
