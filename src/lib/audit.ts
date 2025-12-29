import { Payload } from 'payload'
import { CollectionSlug } from 'payload/types'

interface AuditLogData {
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'password_reset' | 'account_locked' | 'account_unlocked'
  collection: CollectionSlug
  documentId: string | number
  userId: string | number
  userEmail?: string
  userRole?: string
  changes?: Record<string, { before: any; after: any }>
  before?: any
  after?: any
  ipAddress?: string
  userAgent?: string
  description?: string
  metadata?: Record<string, any>
}

/**
 * Create an audit log entry
 * This function is called from collection hooks to track changes
 */
export async function createAuditLog(
  payload: Payload,
  data: AuditLogData
): Promise<void> {
  try {
    // Get request info if available
    const req = (payload as any).req
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown'
    const userAgent = req?.headers?.['user-agent'] || 'unknown'

    await payload.create({
      collection: 'audit-logs',
      data: {
        action: data.action,
        collection: data.collection,
        documentId: String(data.documentId),
        user: data.userId,
        userEmail: data.userEmail,
        userRole: data.userRole,
        changes: data.changes || null,
        before: data.before || null,
        after: data.after || null,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : 'unknown',
        userAgent,
        description: data.description,
        metadata: data.metadata || null,
      },
      overrideAccess: true,
    })
  } catch (error) {
    // Don't throw - audit logging should never break the main operation
    console.error('[Audit Log] Failed to create audit log:', error)
  }
}

/**
 * Compare two objects and return field-level changes
 */
export function getFieldChanges(before: any, after: any): Record<string, { before: any; after: any }> {
  const changes: Record<string, { before: any; after: any }> = {}

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})])

  for (const key of allKeys) {
    const beforeValue = before?.[key]
    const afterValue = after?.[key]

    // Skip if values are the same
    if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
      continue
    }

    // Skip internal Payload fields
    if (['updatedAt', 'createdAt', '_status', 'id'].includes(key)) {
      continue
    }

    changes[key] = {
      before: beforeValue,
      after: afterValue,
    }
  }

  return changes
}

/**
 * Create a human-readable description of the action
 */
export function createAuditDescription(
  action: AuditLogData['action'],
  collection: string,
  documentId: string | number,
  changes?: Record<string, { before: any; after: any }>
): string {
  const collectionName = collection.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  switch (action) {
    case 'create':
      return `Created new ${collectionName} (ID: ${documentId})`
    case 'update':
      const changedFields = changes ? Object.keys(changes).join(', ') : 'fields'
      return `Updated ${collectionName} (ID: ${documentId}) - Changed: ${changedFields}`
    case 'delete':
      return `Deleted ${collectionName} (ID: ${documentId})`
    case 'login':
      return `User logged in (ID: ${documentId})`
    case 'logout':
      return `User logged out (ID: ${documentId})`
    case 'password_reset':
      return `Password reset for user (ID: ${documentId})`
    case 'account_locked':
      return `Account locked for user (ID: ${documentId})`
    case 'account_unlocked':
      return `Account unlocked for user (ID: ${documentId})`
    default:
      return `${action} on ${collectionName} (ID: ${documentId})`
  }
}

