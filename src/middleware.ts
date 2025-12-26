import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (exclude login and API routes)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/api')) {
    // Check for authentication token in cookies
    const token = request.cookies.get('payload-token')?.value

    // Debug logging (always enabled for troubleshooting)
    const allCookies = request.cookies.getAll()
    console.log('[Middleware] ==========================================')
    console.log('[Middleware] Admin route access:', pathname)
    console.log('[Middleware] Request method:', request.method)
    console.log('[Middleware] Request URL:', request.url)
    console.log('[Middleware] Available cookies:', allCookies.map(c => c.name))
    console.log('[Middleware] payload-token found:', !!token)
    if (token) {
      console.log('[Middleware] Token length:', token.length)
      console.log('[Middleware] Token preview:', token.substring(0, 20) + '...')
    }
    console.log('[Middleware] ==========================================')

    // If no token, redirect to login
    if (!token) {
      console.log('[Middleware] ❌ No token found, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('type', 'admin')
      return NextResponse.redirect(loginUrl)
    }

    // If token exists but is invalid (will be caught by getCurrentUserFromCookies),
    // we still let it through to the page, which will handle the redirect
    // This prevents infinite redirect loops
    console.log('[Middleware] ✅ Token found, allowing access (validation happens in page)')
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

