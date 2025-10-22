/**
 * ResumeUploader Component
 * Allows users to upload PDF/DOCX/TXT resume files
 * Shows extraction preview (first 500 chars) after upload
 * 
 * No env vars needed
 */
'use client'

import React, { useState } from 'react'
import { useResumes } from '@/contexts/ResumesContext'

export default function ResumeUploader() {
  const { setResumeFiles, isLoading, error } = useResumes()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    setUploadSuccess(false)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    await setResumeFiles(selectedFiles)
    setUploadSuccess(true)
    setSelectedFiles([])

    // Reset file input
    const input = document.getElementById('resume-input') as HTMLInputElement
    if (input) input.value = ''
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Your Resume(s)</h2>
      <p style={styles.subtitle}>Supported formats: PDF, DOCX, TXT</p>

      <div style={styles.uploadBox}>
        <input
          id="resume-input"
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          onChange={handleFileChange}
          style={styles.fileInput}
        />

        {selectedFiles.length > 0 && (
          <div style={styles.fileList}>
            <p><strong>Selected files:</strong></p>
            <ul>
              {selectedFiles.map((file, idx) => (
                <li key={idx}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isLoading}
          style={{
            ...styles.uploadButton,
            opacity: selectedFiles.length === 0 || isLoading ? 0.5 : 1
          }}
        >
          {isLoading ? 'Uploading...' : 'Upload & Extract Text'}
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {uploadSuccess && (
        <div style={styles.success}>
          ✓ Resume(s) uploaded and text extracted successfully!
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '8px',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  uploadBox: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
  },
  fileInput: {
    marginBottom: '16px',
  },
  fileList: {
    textAlign: 'left',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
  },
  uploadButton: {
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
  },
  success: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#efe',
    color: '#3c3',
    borderRadius: '4px',
  },
}
