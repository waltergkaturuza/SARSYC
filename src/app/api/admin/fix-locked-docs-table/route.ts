import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureLockedDocsRelsColumns } from '@/lib/ensureLockedDocsRelsColumns'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Emergency fix: adds missing collection columns to payload_locked_documents_rels.
 * Run once via GET /api/admin/fix-locked-docs-table to unblock admin document editing.
 */
export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    await ensureLockedDocsRelsColumns(payload)

    return NextResponse.json({
      success: true,
      message:
        'payload_locked_documents_rels patched (includes orathon_countries_id and other collection FKs)',
    })
  } catch (error: any) {
    console.error('fix-locked-docs-table error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
