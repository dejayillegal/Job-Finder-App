import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { JobsClient } from './jobs-client'

export default async function JobsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <JobsClient user={user} />
}
