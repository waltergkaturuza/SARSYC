import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'

export default async function AdminRootPage() {
  // Check authentication before redirecting
  const user = await getCurrentUserFromCookies()
  
  if (!user || user.role !== 'admin') {
    // Clear invalid token cookie if it exists
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')
    
    // Always redirect to login - the cookie clearing will happen via middleware or client-side
    redirect('/login?type=admin&redirect=/admin')
  }

  // User is authenticated, redirect to dashboard
  redirect('/admin/dashboard')
}



