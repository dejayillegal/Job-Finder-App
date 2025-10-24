"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Building, DollarSign, ArrowLeft } from 'lucide-react'

interface Job {
  id: number
  title: string
  company: string
  location: string
  description: string
  requirements: string
  salary_min: number
  salary_max: number
  remote: number
}

export function JobsClient({ user }: { user: any }) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [jobsRes, resumesRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/resumes')
      ])

      const jobsData = await jobsRes.json()
      const resumesData = await resumesRes.json()

      setJobs(jobsData.jobs || [])
      setResumes(resumesData.resumes || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply(jobId: number) {
    if (resumes.length === 0) {
      alert('Please upload a resume first!')
      return
    }

    setApplying(jobId)

    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          resumeId: resumes[0].id // Use first resume
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      alert('Application submitted successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Browse Jobs</h1>

        {loading ? (
          <div className="text-center py-12">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No jobs available at the moment.
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map(job => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    {job.salary_min && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{(job.salary_max / 100000).toFixed(1)}L
                      </div>
                    )}
                    {job.remote === 1 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Remote
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700">{job.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <p className="text-gray-700">{job.requirements}</p>
                    </div>

                    <Button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                    >
                      {applying === job.id ? 'Applying...' : 'Apply Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
