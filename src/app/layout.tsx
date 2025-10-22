/**
 * Root Layout Component
 * Wraps the entire app with ResumesProvider for global state management
 */
import React from 'react'
import { ResumesProvider } from '@/contexts/ResumesContext'
import './globals.css'

export const metadata = {
  title: 'Job Finder - QA/Test Role Assistant',
  description: 'Find relevant QA and Test Engineering roles based on your resume',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ResumesProvider>
          {children}
        </ResumesProvider>
      </body>
    </html>
  )
}
