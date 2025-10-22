/**
 * API Route: /api/resumes/upload
 * Accepts multipart/form-data with "files" field containing PDF/DOCX/TXT files
 * Extracts plain text server-side and saves to data/resume_texts.json
 * 
 * Runtime: Node.js (required for pdf-parse and mammoth)
 * No env vars needed for basic operation
 */
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export const runtime = 'nodejs'

const DATA_DIR = path.join(process.cwd(), 'data')
const RESUME_TEXTS_FILE = path.join(DATA_DIR, 'resume_texts.json')

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = file.name.toLowerCase()

  try {
    if (fileName.endsWith('.pdf')) {
      const data = await pdfParse(buffer)
      return data.text
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    } else if (fileName.endsWith('.txt')) {
      return buffer.toString('utf-8')
    } else {
      throw new Error(`Unsupported file type: ${fileName}`)
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileName}:`, error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Extract text from all files
    const extractedTexts: string[] = []
    for (const file of files) {
      const text = await extractTextFromFile(file)
      extractedTexts.push(text)
    }

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    // Load existing texts if any
    let allTexts: string[] = []
    if (fs.existsSync(RESUME_TEXTS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(RESUME_TEXTS_FILE, 'utf-8'))
      allTexts = existing.texts || []
    }

    // Append new texts
    allTexts.push(...extractedTexts)

    // Save to file
    fs.writeFileSync(
      RESUME_TEXTS_FILE,
      JSON.stringify({ texts: allTexts, updatedAt: new Date().toISOString() }, null, 2)
    )

    return NextResponse.json({ ok: true, count: extractedTexts.length })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
