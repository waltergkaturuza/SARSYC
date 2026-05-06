import type { Payload } from 'payload'

let patchedThisInstance = false

/**
 * Idempotent DDL for registrations columns that Payload expects but that may be missing if
 * `payload migrate` / prodMigrations never ran against this database (common on serverless deploys).
 */
export async function ensureRegistrationsLatestColumns(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  await payload.db.drizzle.execute(
    `ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "stanbic_payment_order_ref" varchar`,
  )
  await payload.db.drizzle.execute(
    `ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "registration_package" varchar`,
  )

  patchedThisInstance = true
}
