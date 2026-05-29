import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendRegistrationConfirmation, sendRegistrationPaymentDueReminder } from '@/lib/mail'
import { ensureSafeguardingTrainingEmailSent } from '@/lib/safeguardingNotifications'
import { logExport } from '@/lib/telemetry'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'
import {
  completePaymentPageUrl,
  paymentDueEmailAmount,
  registrationNeedsPayment,
} from '@/lib/registrationResumePayment'
import { registrationRequiresHostedPayment } from '@/lib/stanbic/ngenius'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, ids } = body

    // Basic validation
    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Get current authenticated user from session
    const acting = await getCurrentUserFromRequest(req)
    
    if (!acting) {
      return NextResponse.json({ 
        error: 'Unauthorized. Please log in to access this resource.' 
      }, { status: 401 })
    }
    
    if (!['admin', 'super-admin'].includes(acting.role)) {
      return NextResponse.json({ 
        error: 'Forbidden. Admin access required.' 
      }, { status: 403 })
    }

    const payload = await getPayloadClient()
    await ensureRegistrationsLatestColumns(payload)

    // Perform actions
    const results: Record<string, any> = { updated: [], failed: [] }

    for (const id of ids) {
      try {
        if (action === 'markConfirmed') {
          const updated = await payload.update({
            collection: 'registrations',
            id,
            data: { status: 'pending', paymentStatus: 'paid' },
          })
          try {
            await ensureSafeguardingTrainingEmailSent(payload, updated as any)
          } catch (e) {
            console.error('[bulk markConfirmed] safeguarding email failed', e)
          }
          results.updated.push(id)
        } else if (action === 'sendEmail') {
          const res = await payload.find({ collection: 'registrations', where: { id: { equals: id } } })
          const doc = res?.docs?.[0]
          if (doc) {
            const to = typeof doc.email === 'string' ? doc.email.trim() : ''
            if (!to) {
              results.failed.push({ id, reason: 'registration has no email' })
            } else {
              sendRegistrationConfirmation({
                to,
                firstName: typeof doc.firstName === 'string' ? doc.firstName : undefined,
                registrationId:
                  typeof doc.registrationId === 'string' ? doc.registrationId : String(doc.id),
                paymentRequired: false,
              }).catch((e) => console.error('send email failed', e))
              results.updated.push(id)
            }
          }
        } else if (action === 'sendPaymentDue') {
          const res = await payload.find({ collection: 'registrations', where: { id: { equals: id } } })
          const doc = res?.docs?.[0] as Record<string, unknown> | undefined
          if (!doc) {
            results.failed.push({ id, reason: 'not found' })
            continue
          }
          if (!registrationNeedsPayment(doc)) {
            results.failed.push({ id, reason: 'payment not due or already paid/waived' })
            continue
          }
          const to = typeof doc.email === 'string' ? doc.email.trim() : ''
          const regHuman =
            typeof doc.registrationId === 'string' ? doc.registrationId : String(doc.id)
          if (!to) {
            results.failed.push({ id, reason: 'registration has no email' })
            continue
          }
          const { packageName, amountUsd } = paymentDueEmailAmount(doc)
          const mailOut = await sendRegistrationPaymentDueReminder({
            to,
            firstName: typeof doc.firstName === 'string' ? doc.firstName : undefined,
            registrationId: regHuman,
            completePaymentUrl: completePaymentPageUrl(regHuman),
            packageName,
            amountUsd,
            hostedPaymentAvailable: registrationRequiresHostedPayment(),
          })
          if (mailOut && 'success' in mailOut && !mailOut.success) {
            results.failed.push({ id, reason: 'email send failed' })
            continue
          }
          try {
            await payload.update({
              collection: 'registrations',
              id,
              data: { paymentDueReminderSentAt: new Date().toISOString() },
              overrideAccess: true,
            })
          } catch {
            /* column may not exist yet; email still sent */
          }
          results.updated.push(id)
        } else if (action === 'softDelete') {
          // If deletedAt field exists it will be set; otherwise mark as cancelled
          try {
            await payload.update({ collection: 'registrations', id, data: { deletedAt: new Date().toISOString(), status: 'cancelled' } })
            results.updated.push(id)
          } catch (err) {
            // Fallback: set status to cancelled and add admin note
            await payload.update({ collection: 'registrations', id, data: { status: 'cancelled', notes: `Soft-deleted by ${acting.email} at ${new Date().toISOString()}` } })
            results.updated.push(id)
          }
        } else {
          results.failed.push({ id, reason: 'unknown action' })
        }
      } catch (err: any) {
        results.failed.push({ id, reason: err?.message || 'update failed' })
      }
    }

    await logExport('bulk-actions.registrations', { admin: { id: acting.id, email: acting.email }, action, count: results.updated.length })

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    console.error('bulk action error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Bulk action failed' }, { status: 500 })
  }
}
