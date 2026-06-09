import type { Payload } from 'payload'
import { getAuditContext } from './auditContext'

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'password_reset'
  | 'account_locked'
  | 'account_unlocked'
  | 'export'
  | 'download'

export interface AuditLogData {
  action: AuditAction
  collection: string
  documentId: string | number
  userId: string | number
  userEmail?: string
  userRole?: string
  changes?: Record<string, { before: unknown; after: unknown }>
  before?: unknown
  after?: unknown
  ipAddress?: string
  userAgent?: string
  description?: string
  metadata?: Record<string, unknown>
}

function requestMeta(request?: Request): { ipAddress: string; userAgent: string } {
  if (!request) {
    const ctx = getAuditContext()
    request = ctx?.request
  }
  const forwarded = request?.headers.get('x-forwarded-for')
  const realIp = request?.headers.get('x-real-ip')
  const ip =
    (forwarded && forwarded.split(',')[0].trim()) ||
    realIp ||
    'unknown'
  const userAgent = request?.headers.get('user-agent') || 'unknown'
  return { ipAddress: ip, userAgent }
}

/**
 * Create an audit log entry (never throws — failures are logged only).
 */
export async function createAuditLog(
  payload: Payload,
  data: AuditLogData,
  request?: Request,
): Promise<void> {
  try {
    const { ipAddress, userAgent } = requestMeta(request)

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
        ipAddress: data.ipAddress || ipAddress,
        userAgent: data.userAgent || userAgent,
        description: data.description,
        metadata: data.metadata || null,
      },
      overrideAccess: true,
    })
  } catch (error) {
    console.error('[Audit Log] Failed to create audit log:', error)
  }
}

export async function logAuthentication(
  payload: Payload,
  request: Request,
  user: { id: string | number; email?: string; role?: string },
  action: 'login' | 'logout',
  metadata?: Record<string, unknown>,
): Promise<void> {
  await createAuditLog(
    payload,
    {
      action,
      collection: 'users',
      documentId: user.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      description: createAuditDescription(action, 'users', user.id),
      metadata,
    },
    request,
  )
}

export async function logDataExport(
  payload: Payload,
  request: Request,
  user: { id: string | number; email?: string; role?: string },
  collection: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await createAuditLog(
    payload,
    {
      action: 'export',
      collection,
      documentId: user.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      description: `Exported ${collection.replace(/-/g, ' ')} data`,
      metadata,
    },
    request,
  )
}

/**
 * Compare two objects and return field-level changes
 */
export function getFieldChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): Record<string, { before: unknown; after: unknown }> {
  const changes: Record<string, { before: unknown; after: unknown }> = {}

  if (!before || typeof before !== 'object') before = {}
  if (!after || typeof after !== 'object') after = {}

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of allKeys) {
    try {
      const beforeValue = before[key]
      const afterValue = after[key]

      if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
        continue
      }

      if (['updatedAt', 'createdAt', '_status', 'id'].includes(key)) {
        continue
      }

      if (Array.isArray(beforeValue) || Array.isArray(afterValue)) {
        changes[key] = {
          before: Array.isArray(beforeValue) ? beforeValue : [],
          after: Array.isArray(afterValue) ? afterValue : [],
        }
        continue
      }

      changes[key] = { before: beforeValue, after: afterValue }
    } catch (error) {
      console.warn(`[Audit] Error comparing field ${key}:`, error)
    }
  }

  return changes
}

export function createAuditDescription(
  action: AuditAction,
  collection: string,
  documentId: string | number,
  changes?: Record<string, { before: unknown; after: unknown }>,
): string {
  const collectionName = collection.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  switch (action) {
    case 'create':
      return `Created new ${collectionName} (ID: ${documentId})`
    case 'update':
      return `Updated ${collectionName} (ID: ${documentId}) — changed: ${
        changes ? Object.keys(changes).join(', ') : 'fields'
      }`
    case 'delete':
      return `Deleted ${collectionName} (ID: ${documentId})`
    case 'login':
      return `User logged in (${documentId})`
    case 'logout':
      return `User logged out (${documentId})`
    case 'password_reset':
      return `Password reset for user (ID: ${documentId})`
    case 'account_locked':
      return `Account locked for user (ID: ${documentId})`
    case 'account_unlocked':
      return `Account unlocked for user (ID: ${documentId})`
    case 'export':
      return `Exported ${collectionName} data`
    case 'download':
      return `Downloaded from ${collectionName} (ID: ${documentId})`
    default:
      return `${action} on ${collectionName} (ID: ${documentId})`
  }
}
