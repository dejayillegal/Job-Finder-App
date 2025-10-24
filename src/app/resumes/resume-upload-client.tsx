"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function ResumeUploadClient({ user }: { user: any }) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleUpload() {
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Upload Resume</h1>

        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle>Select Resume File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <p className="text-lg font-medium mb-2">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supported formats: PDF, DOCX, TXT (Max 5MB)
                    </p>
                  </label>

                  {file && (
                    <div className="mt-4 p-3 bg-blue-50 rounded inline-block">
                      <FileText className="inline w-4 h-4 mr-2" />
                      {file.name}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Upload & Analyze'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>✅ Resume Uploaded Successfully!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">ATS Score</h3>
                    <div className="text-4xl font-bold text-blue-600">
                      {result.atsScore.overall}/100
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Score Breakdown</h3>
                    <div className="space-y-2">
                      {Object.entries(result.atsScore.breakdown).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="capitalize">{key}</span>
                          <span className="font-semibold">{Math.round(value)}/100</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="space-y-1">
                      {result.atsScore.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">• {rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Extracted Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.parsedData.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => { setResult(null); setFile(null); }}>
                      Upload Another
                    </Button>
                    <Link href="/jobs">
                      <Button variant="outline">Browse Jobs</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
