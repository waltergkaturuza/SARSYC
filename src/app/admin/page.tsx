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
    
    if (token) {
      // Create a response that clears the cookie
      const response = NextResponse.redirect(new URL('/login?type=admin&redirect=/admin', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'))
      response.cookies.delete('payload-token')
      return response
    }
    
    redirect('/login?type=admin&redirect=/admin')
  }

  // User is authenticated, redirect to dashboard
  redirect('/admin/dashboard')
}



