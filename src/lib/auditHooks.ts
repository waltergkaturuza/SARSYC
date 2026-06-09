import { getAuditContext } from './auditContext'
import { createAuditLog, getFieldChanges, createAuditDescription } from './audit'

function resolveAuditUser(req: { user?: unknown }) {
  if (req?.user && typeof req.user === 'object' && 'id' in (req.user as object)) {
    return req.user as { id: string | number; email?: string; role?: string }
  }
  return getAuditContext()?.user
}

/**
 * Create beforeChange hook for audit logging
 */
export function createBeforeChangeHook(collectionSlug: string) {
  return async ({ data, req, operation }: { data: Record<string, unknown>; req: { payload?: unknown }; operation?: string }) => {
    if (collectionSlug === 'audit-logs' || operation === 'login' || operation === 'auth' || !req.payload) {
      return data
    }

    if (operation === 'update' && data?.id) {
      try {
        const originalDoc = await (req.payload as { findByID: (args: unknown) => Promise<unknown> }).findByID({
          collection: collectionSlug,
          id: data.id,
          depth: 0,
          overrideAccess: true,
        })
        ;(req as { originalDocument?: unknown }).originalDocument = originalDoc
      } catch (error) {
        console.warn(`[Audit] Could not fetch original document for ${collectionSlug}:`, error)
      }
    }
    return data
  }
}

/**
 * Create afterChange hook for audit logging
 */
export function createAfterChangeHook(collectionSlug: string) {
  return async ({
    doc,
    req,
    operation,
  }: {
    doc: Record<string, unknown>
    req: { user?: unknown; payload?: unknown; originalDocument?: unknown }
    operation?: string
  }) => {
    if (collectionSlug === 'audit-logs' || operation === 'login' || operation === 'auth') {
      return doc
    }

    const user = resolveAuditUser(req)
    if (!user || !req.payload) {
      return doc
    }

    try {
      const originalDoc = req.originalDocument as Record<string, unknown> | undefined

      let changes: Record<string, { before: unknown; after: unknown }> = {}
      if (operation === 'update' && originalDoc) {
        try {
          changes = getFieldChanges(originalDoc, doc)
        } catch (error) {
          console.warn(`[Audit] Error getting field changes for ${collectionSlug}:`, error)
        }
      }

      const action = operation === 'create' ? 'create' : 'update'
      const description = createAuditDescription(action, collectionSlug, doc.id as string | number, changes)

      await createAuditLog(req.payload as Parameters<typeof createAuditLog>[0], {
        action,
        collection: collectionSlug,
        documentId: doc.id as string | number,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        changes: Object.keys(changes).length > 0 ? changes : undefined,
        before: operation === 'update' ? originalDoc : undefined,
        after: doc,
        description,
      })
    } catch (error) {
      console.error(`[Audit] Failed to log ${operation} for ${collectionSlug}:`, error)
    }

    return doc
  }
}

/**
 * Create afterDelete hook for audit logging
 */
export function createAfterDeleteHook(collectionSlug: string) {
  return async ({
    doc,
    req,
  }: {
    doc: Record<string, unknown>
    req: { user?: unknown; payload?: unknown }
  }) => {
    if (collectionSlug === 'audit-logs') {
      return doc
    }

    const user = resolveAuditUser(req)
    if (!user || !req.payload) {
      return doc
    }

    try {
      const description = createAuditDescription('delete', collectionSlug, doc.id as string | number)

      await createAuditLog(req.payload as Parameters<typeof createAuditLog>[0], {
        action: 'delete',
        collection: collectionSlug,
        documentId: doc.id as string | number,
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        before: doc,
        description,
      })
    } catch (error) {
      console.error(`[Audit] Failed to log delete for ${collectionSlug}:`, error)
    }

    return doc
  }
}

/**
 * Add audit hooks to a collection config (idempotent).
 */
export function addAuditHooks(collection: { slug: string; hooks?: Record<string, unknown[]>; _auditHooksApplied?: boolean }) {
  if (collection.slug === 'audit-logs' || collection._auditHooksApplied) {
    return collection
  }
  collection._auditHooksApplied = true

  if (!collection.hooks) {
    collection.hooks = {}
  }

  const slug = collection.slug

  if (!collection.hooks.beforeChange) {
    collection.hooks.beforeChange = []
  }
  collection.hooks.beforeChange.push(createBeforeChangeHook(slug))

  if (!collection.hooks.afterChange) {
    collection.hooks.afterChange = []
  }
  collection.hooks.afterChange.push(createAfterChangeHook(slug))

  if (!collection.hooks.afterDelete) {
    collection.hooks.afterDelete = []
  }
  collection.hooks.afterDelete.push(createAfterDeleteHook(slug))

  return collection
}
