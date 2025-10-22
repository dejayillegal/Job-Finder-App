/**
 * ResumesContext - Global state management for resume texts
 * Provides resumeListText array and methods to upload/refresh resumes
 * 
 * No env vars needed here.
 */
'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface ResumesContextType {
  resumeListText: string[]
  setResumeFiles: (files: File[]) => Promise<void>
  refreshFromServer: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const ResumesContext = createContext<ResumesContextType | undefined>(undefined)

export function ResumesProvider({ children }: { children: React.ReactNode }) {
  const [resumeListText, setResumeListText] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setResumeFiles = useCallback(async (files: File[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Upload result:', result)

      // Refresh texts from server
      await refreshFromServer()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      console.error('Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshFromServer = useCallback(async () => {
    try {
      const response = await fetch('/api/resumes/text')
      if (!response.ok) {
        throw new Error(`Failed to fetch resume texts: ${response.statusText}`)
      }

      const data = await response.json()
      setResumeListText(data.texts || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load resumes'
      setError(message)
      console.error('Refresh error:', err)
    }
  }, [])

  return (
    <ResumesContext.Provider
      value={{ resumeListText, setResumeFiles, refreshFromServer, isLoading, error }}
    >
      {children}
    </ResumesContext.Provider>
  )
}

export function useResumes() {
  const context = useContext(ResumesContext)
  if (!context) {
    throw new Error('useResumes must be used within ResumesProvider')
  }
  return context
}
