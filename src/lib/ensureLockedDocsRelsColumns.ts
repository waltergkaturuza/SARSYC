import type { Payload } from 'payload'

let patchedThisInstance = false

/**
 * Payload document-locking joins require a FK column per collection on
 * payload_locked_documents_rels. New collections break edits until their column exists.
 */
const LOCKED_DOCS_RELS_COLUMNS = [
  'participants_id',
  'newsletter_subscriptions_id',
  'contact_messages_id',
  'sponsorship_tiers_id',
  'partnership_inquiries_id',
  'venue_locations_id',
  'audit_logs_id',
  'volunteers_id',
  'youth_steering_committee_id',
  'orathon_registrations_id',
  'abstract_reviews_id',
  'page_views_id',
  'site_events_id',
  'donations_id',
  'stanbic_payment_events_id',
] as const

export async function ensureLockedDocsRelsColumns(payload: Payload): Promise<void> {
  if (patchedThisInstance) return

  for (const column of LOCKED_DOCS_RELS_COLUMNS) {
    await payload.db.drizzle.execute(
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "${column}" integer`,
    )
  }

  patchedThisInstance = true
}
