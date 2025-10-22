/**
 * Dashboard Page Client Component
 * Main UI that displays:
 * 1. Resume uploader
 * 2. Relevant job roles sorted by score
 * 3. Portal links for each role
 * 4. Optional preview functionality
 * 
 * Environment Variables (optional):
 * - NEXT_PUBLIC_PREVIEW_ENDPOINT: Firebase preview function URL
 * - NEXT_PUBLIC_PREVIEW_API_KEY: API key for preview function
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useResumes } from '@/contexts/ResumesContext'
import ResumeUploader from '@/components/ResumeUploader'
import { findRelevantJobs, JobRole } from '@/ai/flows/find-relevant-jobs'

export default function PageClient() {
  const { resumeListText, refreshFromServer } = useResumes()
  const [roles, setRoles] = useState<JobRole[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewData, setPreviewData] = useState<Record<string, any>>({})
  const [loadingPreview, setLoadingPreview] = useState<Record<string, boolean>>({})

  // Load resume texts on mount
  useEffect(() => {
    refreshFromServer()
  }, [refreshFromServer])

  // Analyze resumes when texts are loaded
  useEffect(() => {
    if (resumeListText.length > 0 && !isAnalyzing) {
      analyzeResumes()
    }
  }, [resumeListText])

  const analyzeResumes = async () => {
    setIsAnalyzing(true)
    try {
      const result = await findRelevantJobs(resumeListText)
      setRoles(result.roles.filter(r => r.score > 0))
    } catch (error) {
      console.error('Error analyzing resumes:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePreview = async (role: string, portalName: string, url: string) => {
    const key = `${role}-${portalName}`

    const endpoint = process.env.NEXT_PUBLIC_PREVIEW_ENDPOINT
    const apiKey = process.env.NEXT_PUBLIC_PREVIEW_API_KEY

    if (!endpoint || !apiKey) {
      alert('Preview function not configured. Opening search page instead.')
      window.open(url, '_blank')
      return
    }

    setLoadingPreview(prev => ({ ...prev, [key]: true }))

    try {
      const previewUrl = `${endpoint}?url=${encodeURIComponent(url)}`
      const response = await fetch(previewUrl, {
        headers: {
          'x-api-key': apiKey
        }
      })

      // Check if response is OK and JSON
      if (!response.ok) {
        throw new Error(`Preview failed: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        // Server returned HTML or other non-JSON
        const text = await response.text()
        console.error('Non-JSON response:', text.slice(0, 500))
        throw new Error('Server returned non-JSON response')
      }

      const data = await response.json()

      if (response.status === 204 || !data.snippet) {
        alert('No preview available for this page.')
      } else {
        setPreviewData(prev => ({ ...prev, [key]: data }))
      }
    } catch (error) {
      console.error('Preview error:', error)
      alert(`Preview unavailable. ${error instanceof Error ? error.message : 'Unknown error'}\nOpening search page instead.`)
      window.open(url, '_blank')
    } finally {
      setLoadingPreview(prev => ({ ...prev, [key]: false }))
    }
  }

  if (resumeListText.length === 0) {
    return (
      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.mainTitle}>Job Finder - QA/Test Roles</h1>
          <p style={styles.mainSubtitle}>Upload your resume to get started</p>
        </div>
        <ResumeUploader />
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <div style={styles.header}>
        <h1 style={styles.mainTitle}>Job Finder - QA/Test Roles</h1>
        <p style={styles.mainSubtitle}>
          {resumeListText.length} resume(s) analyzed • {roles.length} relevant roles found
        </p>
      </div>

      <ResumeUploader />

      {isAnalyzing && (
        <div style={styles.analyzing}>
          <p>Analyzing resumes...</p>
        </div>
      )}

      {!isAnalyzing && roles.length > 0 && (
        <div style={styles.rolesContainer}>
          <h2 style={styles.rolesTitle}>Recommended Roles</h2>

          <div style={styles.rolesGrid}>
            {roles.map((role, idx) => (
              <RoleCard
                key={idx}
                role={role}
                onPreview={handlePreview}
                previewData={previewData}
                loadingPreview={loadingPreview}
              />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}

interface RoleCardProps {
  role: JobRole
  onPreview: (role: string, portal: string, url: string) => void
  previewData: Record<string, any>
  loadingPreview: Record<string, boolean>
}

function RoleCard({ role, onPreview, previewData, loadingPreview }: RoleCardProps) {
  const portals = [
    { name: 'Naukri', url: role.searchLinks.naukri },
    { name: 'LinkedIn', url: role.searchLinks.linkedin },
    { name: 'Indeed', url: role.searchLinks.indeed },
    { name: 'Glassdoor', url: role.searchLinks.glassdoor },
    { name: 'Monster', url: role.searchLinks.monster },
    { name: 'Adzuna', url: role.searchLinks.adzuna },
    { name: 'Google', url: role.searchLinks.google },
  ]

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.roleTitle}>{role.role}</h3>
        <div style={styles.scoreBadge}>Score: {role.score}</div>
      </div>

      <p style={styles.reason}>{role.reason}</p>

      <div style={styles.linksSection}>
        <h4 style={styles.linksTitle}>Search on:</h4>
        <div style={styles.linksGrid}>
          {portals.map(portal => {
            const key = `${role.role}-${portal.name}`
            const preview = previewData[key]
            const loading = loadingPreview[key]

            return (
              <div key={portal.name} style={styles.portalItem}>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.portalLink}
                >
                  {portal.name}
                </a>
                <button
                  onClick={() => onPreview(role.role, portal.name, portal.url)}
                  style={styles.previewButton}
                  disabled={loading}
                >
                  {loading ? '...' : '👁'}
                </button>

                {preview && (
                  <div style={styles.previewBox}>
                    <strong>Preview:</strong>
                    <p style={styles.previewText}>{preview.snippet}</p>
                    <small>Source: {preview.sourceHost}</small>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  mainTitle: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '8px',
  },
  mainSubtitle: {
    fontSize: '16px',
    color: '#666',
  },
  analyzing: {
    textAlign: 'center',
    padding: '32px',
    fontSize: '18px',
    color: '#666',
  },
  rolesContainer: {
    marginTop: '32px',
  },
  rolesTitle: {
    fontSize: '28px',
    marginBottom: '24px',
    color: '#333',
  },
  rolesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  roleTitle: {
    fontSize: '20px',
    color: '#0070f3',
    margin: 0,
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
  },
  reason: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  linksSection: {
    borderTop: '1px solid #eee',
    paddingTop: '16px',
  },
  linksTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333',
  },
  linksGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  portalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  portalLink: {
    color: '#0070f3',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    flex: 1,
    minWidth: '100px',
  },
  previewButton: {
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  previewBox: {
    width: '100%',
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    fontSize: '13px',
  },
  previewText: {
    margin: '8px 0',
    color: '#333',
  },
}
