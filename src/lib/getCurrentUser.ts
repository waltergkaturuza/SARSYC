import { getPayloadClient } from './payload'

// Get user from request headers in API routes
// For now, we'll allow actions without strict auth (for development)
// TODO: Implement proper session-based authentication
export async function getCurrentUserFromRequest(req: Request) {
  try {
    const payload = await getPayloadClient()
    
    // Try to get user ID from header (backwards compatibility)
    const adminId = req.headers.get('x-admin-user-id')
    
    if (adminId) {
      const userRes = await payload.find({ 
        collection: 'users', 
        where: { id: { equals: adminId } } 
      })
      const user = userRes?.docs?.[0]
      
      if (user && ['admin', 'super-admin'].includes(user.role)) {
        return user
      }
    }
    
    // For development: if no header, allow if we're in dev mode
    // In production, this should be replaced with proper session-based auth
    if (process.env.NODE_ENV === 'development') {
      // Try to get the first admin user as a fallback
      const adminUsers = await payload.find({
        collection: 'users',
        where: { role: { equals: 'admin' } },
        limit: 1
      })
      
      if (adminUsers?.docs?.[0]) {
        return adminUsers.docs[0]
      }
    }
    
    return null
  } catch (error) {
    console.error('Error getting current user from request:', error)
    return null
  }
}

