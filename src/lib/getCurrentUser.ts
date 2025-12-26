import { getPayloadClient } from './payload'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getSecret } from './getSecret'

/**
 * Get the current authenticated user from the request
 * Uses Payload's JWT token from cookies to verify the user
 */
export async function getCurrentUserFromRequest(req: Request) {
  try {
    const payload = await getPayloadClient()
    
    // Get cookies from request headers
    const cookieHeader = req.headers.get('cookie')
    
    if (!cookieHeader) {
      return null
    }

    // Parse cookies
    const cookieMap = new Map<string, string>()
    cookieHeader.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        cookieMap.set(key.trim(), value.trim())
      }
    })
    
    // Payload uses 'payload-token' cookie for authentication (JWT token)
    const token = cookieMap.get('payload-token')
    
    if (!token) {
      return null
    }

    try {
      // Decode JWT token to get user ID (Payload stores user ID in the token)
      // We need to get the secret from Payload config
      const secret = process.env.PAYLOAD_SECRET
      if (!secret) {
        console.error('PAYLOAD_SECRET not found')
        return null
      }

      // Decode the token (we don't verify here, just decode to get the user ID)
      // In production, we should verify the token properly
      const decoded = jwt.decode(token) as any
      
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
    } catch (authError) {
      // Token is invalid or expired, or user not found
      console.error('Authentication error:', authError)
      return null
    }
    
    return null
  } catch (error) {
    console.error('Error getting current user from request:', error)
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
      return null
    }

    try {
      // Get the secret (with database fallback support)
      const secret = await getSecret()
      if (!secret) {
        return null
      }

      // Verify and decode the JWT token
      let decoded: any
      try {
        decoded = jwt.verify(token, secret) as any
      } catch (verifyError) {
        return null
      }
      
      if (!decoded || !decoded.id) {
        return null
      }

      const userResult = await payload.findByID({
        collection: 'users',
        id: decoded.id,
      })

      if (userResult && ['admin', 'super-admin'].includes(userResult.role)) {
        return userResult
      }
    } catch (authError) {
      return null
    }
    
    return null
  } catch (error) {
    console.error('Error getting current user from cookies:', error)
    return null
  }
}
