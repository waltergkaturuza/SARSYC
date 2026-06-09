import { AsyncLocalStorage } from 'node:async_hooks'

/** Carries the acting user + HTTP request through admin API handlers for audit hooks. */
export type AuditContext = {
  user: {
    id: string | number
    email?: string
    role?: string
  }
  request: Request
}

const auditStorage = new AsyncLocalStorage<AuditContext>()

/** Run handler with audit context (preferred in API routes). */
export function runWithAuditContext<T>(
  ctx: AuditContext,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  return auditStorage.run(ctx, fn)
}

/** Set audit context for the remainder of the current async execution chain. */
export function setAuditContext(ctx: AuditContext): void {
  auditStorage.enterWith(ctx)
}

export function getAuditContext(): AuditContext | undefined {
  return auditStorage.getStore()
}
