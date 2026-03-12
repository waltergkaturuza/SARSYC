import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Emergency fix: adds missing collection columns to payload_locked_documents_rels.
 * Run once via GET /api/admin/fix-locked-docs-table to unblock speaker/document editing.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()

    const statements = [
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "audit_logs_id" integer`,
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "volunteers_id" integer`,
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "youth_steering_committee_id" integer`,
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "orathon_registrations_id" integer`,
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "abstract_reviews_id" integer`,
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "page_views_id" integer`,
      `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "site_events_id" integer`,
    ]

    const results: string[] = []

    for (const stmt of statements) {
      try {
        await payload.db.drizzle.execute(stmt)
        const col = stmt.match(/"(\w+)"[^"]*$/)?.[1] ?? stmt
        results.push(`✅ ${col}`)
        console.log('✅ Executed:', stmt)
      } catch (err: any) {
        const msg = err?.message || String(err)
        results.push(`⚠️ ${msg}`)
        console.warn('⚠️ Statement warning:', msg)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'payload_locked_documents_rels patched',
      results,
    })
  } catch (error: any) {
    console.error('fix-locked-docs-table error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
