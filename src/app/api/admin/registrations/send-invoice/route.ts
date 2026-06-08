import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendRegistrationInvoice } from '@/lib/mail'
import { logExport } from '@/lib/telemetry'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'
import {
  paymentDueEmailAmount,
  registrationIsActive,
} from '@/lib/registrationResumePayment'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { ids } = body as { ids?: unknown }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Select at least one registration' }, { status: 400 })
    }

    const acting = await getCurrentUserFromRequest(req)
    if (!acting) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }
    if (!['admin', 'super-admin'].includes(acting.role)) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    const payload = await getPayloadClient()
    await ensureRegistrationsLatestColumns(payload)

    const results: { sent: string[]; failed: { id: string; reason: string }[] } = {
      sent: [],
      failed: [],
    }

    for (const id of ids) {
      try {
        const res = await payload.find({
          collection: 'registrations',
          where: { id: { equals: id } },
          limit: 1,
          overrideAccess: true,
        })
        const doc = res?.docs?.[0] as Record<string, unknown> | undefined
        if (!doc) {
          results.failed.push({ id: String(id), reason: 'not found' })
          continue
        }
        if (!registrationIsActive(doc)) {
          results.failed.push({ id: String(id), reason: 'cancelled or soft-deleted' })
          continue
        }
        if (doc.paymentStatus === 'waived') {
          results.failed.push({ id: String(id), reason: 'fee waived' })
          continue
        }

        const to = typeof doc.email === 'string' ? doc.email.trim() : ''
        if (!to) {
          results.failed.push({ id: String(id), reason: 'no email' })
          continue
        }

        const { packageName, amountUsd } = paymentDueEmailAmount(doc)
        if (!packageName || amountUsd == null || amountUsd <= 0) {
          results.failed.push({ id: String(id), reason: 'no package or fee amount' })
          continue
        }

        const first = typeof doc.firstName === 'string' ? doc.firstName : ''
        const last = typeof doc.lastName === 'string' ? doc.lastName : ''
        const fullName = `${first} ${last}`.trim() || 'Delegate'
        const regHuman =
          typeof doc.registrationId === 'string' ? doc.registrationId : String(doc.id)

        const mailOut = await sendRegistrationInvoice({
          to,
          fullName,
          organisation: typeof doc.organization === 'string' ? doc.organization : undefined,
          registrationId: regHuman,
          packageName,
          amountUsd,
        })

        if (mailOut && 'success' in mailOut && !mailOut.success) {
          results.failed.push({ id: String(id), reason: 'email send failed' })
          continue
        }

        try {
          await payload.update({
            collection: 'registrations',
            id,
            data: { invoiceSentAt: new Date().toISOString() },
            overrideAccess: true,
          })
        } catch {
          /* column may not exist yet; email still sent */
        }

        results.sent.push(String(id))
      } catch (err: unknown) {
        const reason = err instanceof Error ? err.message : 'send failed'
        results.failed.push({ id: String(id), reason })
      }
    }

    await logExport('send-invoice.registrations', {
      admin: { id: acting.id, email: acting.email },
      sent: results.sent.length,
      failed: results.failed.length,
    })

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Send invoice failed'
    console.error('[send-invoice]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
