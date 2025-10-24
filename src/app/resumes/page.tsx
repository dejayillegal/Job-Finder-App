import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { ResumeUploadClient } from './resume-upload-client'

export default async function ResumesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <ResumeUploadClient user={user} />
}
