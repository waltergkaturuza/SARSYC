import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'

export default async function AdminRootPage() {
  // Check authentication before redirecting
  const user = await getCurrentUserFromCookies()
  
  if (!user || user.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin')
  }

  // User is authenticated, redirect to dashboard
  redirect('/admin/dashboard')
}



