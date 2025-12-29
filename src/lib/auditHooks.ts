import { createAuditLog, getFieldChanges, createAuditDescription } from './audit'

/**
 * Create beforeChange hook for audit logging
 */
export function createBeforeChangeHook(collectionSlug: string) {
  return async ({ data, req, operation }: any) => {
    // Store original data for comparison
    if (operation === 'update' && req.payload) {
      try {
        const originalDoc = await req.payload.findByID({
          collection: collectionSlug as any,
          id: data.id,
          depth: 0,
          overrideAccess: true,
        })
        // Store in request context for afterChange hook
        ;(req as any).originalDocument = originalDoc
      } catch (error) {
        // Document might not exist or access denied - that's okay
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
  return async ({ doc, req, operation }: any) => {
    if (!req.user || !req.payload) {
      return doc
    }

    try {
      const originalDoc = (req as any).originalDocument
      const changes = operation === 'update' && originalDoc
        ? getFieldChanges(originalDoc, doc)
        : {}

      const description = createAuditDescription(
        operation === 'create' ? 'create' : 'update',
        collectionSlug,
        doc.id,
        changes
      )

      await createAuditLog(req.payload, {
        action: operation === 'create' ? 'create' : 'update',
        collection: collectionSlug as any,
        documentId: doc.id,
        userId: req.user.id,
        userEmail: (req.user as any).email,
        userRole: (req.user as any).role,
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
  return async ({ doc, req }: any) => {
    if (!req.user || !req.payload) {
      return doc
    }

    try {
      const description = createAuditDescription('delete', collectionSlug, doc.id)

      await createAuditLog(req.payload, {
        action: 'delete',
        collection: collectionSlug as any,
        documentId: doc.id,
        userId: req.user.id,
        userEmail: (req.user as any).email,
        userRole: (req.user as any).role,
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
 * Add audit hooks to a collection config
 */
export function addAuditHooks(collection: any) {
  if (!collection.hooks) {
    collection.hooks = {}
  }

  const slug = collection.slug

  // Add beforeChange hook
  if (!collection.hooks.beforeChange) {
    collection.hooks.beforeChange = []
  }
  collection.hooks.beforeChange.push(createBeforeChangeHook(slug))

  // Add afterChange hook
  if (!collection.hooks.afterChange) {
    collection.hooks.afterChange = []
  }
  collection.hooks.afterChange.push(createAfterChangeHook(slug))

  // Add afterDelete hook
  if (!collection.hooks.afterDelete) {
    collection.hooks.afterDelete = []
  }
  collection.hooks.afterDelete.push(createAfterDeleteHook(slug))

  return collection
}

