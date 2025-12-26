import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (exclude login and API routes)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/api')) {
    // Check for authentication token in cookies
    const token = request.cookies.get('payload-token')?.value

    // Debug logging (enable in production too for troubleshooting)
    const allCookies = request.cookies.getAll()
    console.log('[Middleware] Admin route access:', pathname)
    console.log('[Middleware] Available cookies:', allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
    console.log('[Middleware] payload-token found:', !!token)
    console.log('[Middleware] Request URL:', request.url)

    // If no token, redirect to login
    if (!token) {
      console.log('[Middleware] No token found, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('type', 'admin')
      return NextResponse.redirect(loginUrl)
    }

    console.log('[Middleware] Token found, allowing access')
    // Token exists - let it through
    // Server-side pages will validate the token and user role
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}

