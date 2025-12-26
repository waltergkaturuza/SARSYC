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
      // Get the secret (with database fallback support)
      const secret = await getSecret()
      if (!secret) {
        console.error('PAYLOAD_SECRET not found')
        return null
      }

      // Verify and decode the JWT token
      let decoded: any
      try {
        decoded = jwt.verify(token, secret) as any
      } catch (verifyError: any) {
        // Token is invalid or expired
        if (process.env.NODE_ENV === 'development') {
          console.error('Token verification failed:', verifyError.message)
        }
        return null
      }
      
      if (!decoded || !decoded.id) {
        return null
      }

      // Get the user from Payload using the ID from the token
      const userResult = await payload.findByID({
        collection: 'users',
        id: decoded.id,
      })

      if (userResult && ['admin', 'super-admin'].includes(userResult.role)) {
        return userResult
      }
    } catch (authError: any) {
      // User not found or other error
      if (process.env.NODE_ENV === 'development') {
        console.error('Authentication error:', authError.message)
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
      // IMPORTANT: Use the same secret that Payload uses in its config
      // Payload's buildConfig uses process.env.PAYLOAD_SECRET directly
      // We must use the exact same value to verify tokens
      const payloadSecret = process.env.PAYLOAD_SECRET
      
      if (!payloadSecret) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[getCurrentUserFromCookies] PAYLOAD_SECRET not found in env')
        }
        return null
      }

      // Verify and decode the JWT token using Payload's secret
      let decoded: any
      try {
        decoded = jwt.verify(token, payloadSecret) as any
        if (process.env.NODE_ENV === 'development') {
          console.log('[getCurrentUserFromCookies] Token verified successfully, user ID:', decoded.id)
        }
      } catch (verifyError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[getCurrentUserFromCookies] Token verification failed:', verifyError.message)
          console.error('[getCurrentUserFromCookies] Secret length used:', payloadSecret.length)
          console.error('[getCurrentUserFromCookies] Token preview:', token.substring(0, 50) + '...')
        }
        return null
      }
      
      if (!decoded || !decoded.id) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[getCurrentUserFromCookies] Token decoded but missing id:', decoded)
        }
        return null
      }

      // Get the user from Payload using the ID from the token
      const userResult = await payload.findByID({
        collection: 'users',
        id: decoded.id,
      })

      if (!userResult) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[getCurrentUserFromCookies] User not found with id:', decoded.id)
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
