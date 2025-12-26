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
      // Get the secret (with database fallback support)
      const secret = await getSecret()
      if (!secret) {
        if (process.env.NODE_ENV === 'development') {
          console.error('PAYLOAD_SECRET not found in getCurrentUserFromCookies')
        }
        return null
      }

      // Verify and decode the JWT token
      let decoded: any
      try {
        decoded = jwt.verify(token, secret) as any
      } catch (verifyError: any) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Token verification failed in getCurrentUserFromCookies:', verifyError.message)
        }
        return null
      }
      
      if (!decoded || !decoded.id) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Token decoded but missing id:', decoded)
        }
        return null
      }

      const userResult = await payload.findByID({
        collection: 'users',
        id: decoded.id,
      })

      if (!userResult) {
        if (process.env.NODE_ENV === 'development') {
          console.error('User not found with id:', decoded.id)
        }
        return null
      }

      if (userResult && ['admin', 'super-admin'].includes(userResult.role)) {
        return userResult
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('User role is not admin:', userResult.role)
        }
        return null
      }
    } catch (authError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Authentication error in getCurrentUserFromCookies:', authError.message)
      }
      return null
    }
  } catch (error: any) {
    console.error('Error getting current user from cookies:', error?.message || error)
    return null
  }
}
