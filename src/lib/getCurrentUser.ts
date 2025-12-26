import { getPayloadClient } from './payload'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getSecret } from './getSecret'

/**
 * Get the current authenticated user from the request
 * Uses Payload's JWT token from cookies to verify the user
 * 
 * Note: Payload uses different cookie names depending on the version and configuration.
 * Common cookie names: 'payload-token', 'payload_token', 'token'
 * We try all common cookie names to find the token.
 */
export async function getCurrentUserFromRequest(req: Request) {
  try {
    const payload = await getPayloadClient()
    
    // Get cookies from request headers
    const cookieHeader = req.headers.get('cookie')
    
    if (!cookieHeader) {
      return null
    }

    // Parse cookies into a map
    const cookieMap = new Map<string, string>()
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join('=').trim() // Handle values with '=' in them
        cookieMap.set(key, decodeURIComponent(value))
      }
    })
    
    // Try multiple possible cookie names that Payload might use
    const possibleCookieNames = ['payload-token', 'payload_token', 'token', 'payload-token-cookie']
    let token: string | undefined
    
    for (const cookieName of possibleCookieNames) {
      if (cookieMap.has(cookieName)) {
        token = cookieMap.get(cookieName)
        break
      }
    }
    
    if (!token) {
      // Debug: log all cookies to see what's available (only in dev)
      if (process.env.NODE_ENV === 'development') {
        console.log('Available cookies:', Array.from(cookieMap.keys()))
      }
      return null
    }

    try {
      // Use Payload's built-in authentication instead of manual JWT verification
      try {
        const authResult = await payload.auth.verify({
          token,
        })

        if (!authResult || !authResult.user) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[getCurrentUserFromRequest] Payload auth.verify returned no user')
          }
          return null
        }

        // Get the full user object
        const userResult = await payload.findByID({
          collection: 'users',
          id: authResult.user.id,
        })

        if (!userResult) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[getCurrentUserFromRequest] User not found with id:', authResult.user.id)
          }
          return null
        }

        if (userResult && ['admin', 'super-admin'].includes(userResult.role)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[getCurrentUserFromRequest] ✅ Admin user authenticated:', userResult.email)
          }
          return userResult
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[getCurrentUserFromRequest] User role is not admin:', userResult.role)
          }
          return null
        }
      } catch (verifyError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[getCurrentUserFromRequest] ❌ Payload auth.verify failed:', verifyError.message)
        }
        return null
      }
    } catch (authError: any) {
      // User not found or other error
      if (process.env.NODE_ENV === 'development') {
        console.error('[getCurrentUserFromRequest] Authentication error:', authError.message)
      }
      return null
    }
    
    return null
  } catch (error: any) {
    console.error('Error getting current user from request:', error?.message || error)
    return null
  }
}

/**
 * Get current user from Next.js cookies (for server components)
 */
export async function getCurrentUserFromCookies() {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()
    
    const token = cookieStore.get('payload-token')?.value
    
    if (!token) {
      // Debug: log available cookies in development
      if (process.env.NODE_ENV === 'development') {
        const allCookies = cookieStore.getAll()
        console.log('Available cookies:', allCookies.map(c => c.name))
      }
      return null
    }

    try {
      // Use Payload's built-in authentication instead of manual JWT verification
      // This ensures we use the exact same secret and verification logic that Payload uses
      // Payload's auth.verify() method handles token verification internally
      try {
        // Use Payload's verify method which uses the same secret from payload.init()
        const authResult = await payload.auth.verify({
          token,
        })

        if (!authResult || !authResult.user) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[getCurrentUserFromCookies] Payload auth.verify returned no user')
          }
          return null
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[getCurrentUserFromCookies] ✅ Token verified successfully via Payload auth, user ID:', authResult.user.id)
        }

        // Get the full user object
        const userResult = await payload.findByID({
          collection: 'users',
          id: authResult.user.id,
        })

        if (!userResult) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[getCurrentUserFromCookies] User not found with id:', authResult.user.id)
          }
          return null
        }

        // Check if user has admin role
        if (userResult && ['admin', 'super-admin'].includes(userResult.role)) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[getCurrentUserFromCookies] ✅ Admin user authenticated:', userResult.email)
          }
          return userResult
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[getCurrentUserFromCookies] User role is not admin:', userResult.role)
          }
          return null
        }
      } catch (verifyError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[getCurrentUserFromCookies] ❌ Payload auth.verify failed:', verifyError.message)
          console.error('[getCurrentUserFromCookies] Token preview:', token.substring(0, 50) + '...')
        }
        return null
      }
    } catch (authError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[getCurrentUserFromCookies] Authentication error:', authError.message)
        console.error('[getCurrentUserFromCookies] Error stack:', authError.stack)
      }
      return null
    }
  } catch (error: any) {
    console.error('Error getting current user from cookies:', error?.message || error)
    return null
  }
}
