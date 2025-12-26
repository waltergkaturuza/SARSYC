import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (exclude login and API routes)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/api')) {
    // Check for authentication token in cookies
    const token = request.cookies.get('payload-token')?.value

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      loginUrl.searchParams.set('type', 'admin')
      return NextResponse.redirect(loginUrl)
    }

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

