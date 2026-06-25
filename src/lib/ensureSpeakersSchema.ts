import type { Payload } from 'payload'

let patchedThisInstance = false

/**
 * Idempotent DDL for speakers columns added after initial deploy.
 * Runs once per serverless instance so queries don't fail on missing columns.
 */
export async function ensureSpeakersLatestColumns(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  await (payload.db as any).drizzle.execute(
    `ALTER TABLE "speakers" ADD COLUMN IF NOT EXISTS "abstract_title" varchar`,
  )

  patchedThisInstance = true
}
