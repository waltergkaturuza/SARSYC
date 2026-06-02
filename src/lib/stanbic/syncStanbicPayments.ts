import type { Payload } from 'payload'
import { stanbicHostedPaymentsConfigured } from '@/lib/stanbic/ngenius'
import { logStanbicPaymentEvent } from '@/lib/stanbic/paymentJsonLog'
import { buildStanbicReturnLogPayload } from '@/lib/stanbic/stanbicCertification'
import {
  verifyStanbicOrderReference,
  retrieveHttpFromStanbicError,
  stanbicVerificationErrorMessage,
} from '@/lib/stanbic/verifyStanbicOrder'
import {
  sendRegistrationPaymentConfirmed,
} from '@/lib/mail'
import { ensureSafeguardingTrainingEmailSent } from '@/lib/safeguardingNotifications'
import { ensureRegistrationsLatestColumns } from '@/lib/ensureRegistrationSchema'

const REGISTRATION_ITEM_DESCRIPTION = 'SARSYC registration fee'
const BULK_SYNC_LIMIT = 40

export type StanbicSyncKind = 'registration' | 'donation' | 'sponsorship'

export type StanbicSyncResult = {
  kind: StanbicSyncKind
  reference: string
  paid: boolean
  updated: boolean
  pending: boolean
  failed: boolean
  skipped?: boolean
  error?: string
  paymentState?: string
}

export type BulkStanbicSyncSummary = {
  ok: boolean
  scanned: number
  newlyPaid: number
  stillPending: number
  failed: number
  skipped: number
  results: StanbicSyncResult[]
  truncated: boolean
  error?: string
}

function donationKind(doc: Record<string, unknown>): StanbicSyncKind {
  return doc.type === 'sponsorship' ? 'sponsorship' : 'donation'
}

function hasStanbicRef(doc: Record<string, unknown>): string | null {
  const ref =
    typeof doc.stanbicPaymentOrderRef === 'string' ? doc.stanbicPaymentOrderRef.trim() : ''
  return ref || null
}

export async function syncRegistrationWithStanbic(
  payload: Payload,
  registrationPayloadId: string,
): Promise<StanbicSyncResult> {
  const reference = registrationPayloadId

  if (!stanbicHostedPaymentsConfigured()) {
    return {
      kind: 'registration',
      reference,
      paid: false,
      updated: false,
      pending: true,
      failed: false,
      error: 'gateway_not_configured',
    }
  }

  let registration: Record<string, unknown>
  try {
    registration = (await payload.findByID({
      collection: 'registrations',
      id: registrationPayloadId,
      overrideAccess: true,
    })) as Record<string, unknown>
  } catch {
    return {
      kind: 'registration',
      reference,
      paid: false,
      updated: false,
      pending: false,
      failed: true,
      error: 'registration_not_found',
    }
  }

  const registrationRef =
    typeof registration.registrationId === 'string'
      ? registration.registrationId
      : registrationPayloadId
  const orderRef = hasStanbicRef(registration)

  if (registration.paymentStatus === 'paid' || registration.paymentStatus === 'waived') {
    return {
      kind: 'registration',
      reference: registrationRef,
      paid: true,
      updated: false,
      pending: false,
      failed: false,
      skipped: true,
    }
  }

  if (!orderRef) {
    return {
      kind: 'registration',
      reference: registrationRef,
      paid: false,
      updated: false,
      pending: true,
      failed: false,
      skipped: true,
      error: 'no_stanbic_order_ref',
    }
  }

  try {
    const verification = await verifyStanbicOrderReference(orderRef)
    const { parsed, retrieveHttpStatus } = verification
    const paid = parsed.verificationApproved
    let updated = false

    if (paid) {
      const wasNotPaidYet =
        registration.paymentStatus !== 'paid' && registration.paymentStatus !== 'waived'

      await payload.update({
        collection: 'registrations',
        id: registrationPayloadId,
        data: {
          paymentStatus: 'paid',
          status: registration.status === 'cancelled' ? registration.status : 'pending',
          stanbicPaymentOrderRef: orderRef,
        },
        overrideAccess: true,
      })
      updated = true

      const updatedReg = await payload.findByID({
        collection: 'registrations',
        id: registrationPayloadId,
        overrideAccess: true,
      })

      const regEmail = typeof registration.email === 'string' ? registration.email.trim() : ''
      if (wasNotPaidYet && regEmail) {
        try {
          await sendRegistrationPaymentConfirmed({
            to: regEmail,
            firstName:
              typeof registration.firstName === 'string' ? registration.firstName : undefined,
            registrationId: registrationRef,
          })
        } catch (mailErr: unknown) {
          console.error('[stanbic bulk sync] payment-confirmed email failed:', mailErr)
        }
        try {
          await ensureSafeguardingTrainingEmailSent(payload, updatedReg as any)
        } catch (sgErr: unknown) {
          console.error('[stanbic bulk sync] safeguarding email failed:', sgErr)
        }
      }

      logStanbicPaymentEvent(
        buildStanbicReturnLogPayload({
          method: 'POST',
          registrationRef,
          registrationPayloadId,
          orderReference: orderRef,
          itemDescription: REGISTRATION_ITEM_DESCRIPTION,
          category: registration.category,
          email: registration.email,
          verificationHttp: retrieveHttpStatus,
          parsed,
          dbPaymentStatusUpdated: true,
        }),
      )

      return {
        kind: 'registration',
        reference: registrationRef,
        paid: true,
        updated,
        pending: false,
        failed: false,
        paymentState: parsed.primaryPaymentState,
      }
    }

    logStanbicPaymentEvent(
      buildStanbicReturnLogPayload({
        method: 'POST',
        registrationRef,
        registrationPayloadId,
        orderReference: orderRef,
        itemDescription: REGISTRATION_ITEM_DESCRIPTION,
        category: registration.category,
        email: registration.email,
        verificationHttp: retrieveHttpStatus,
        parsed,
        dbPaymentStatusUpdated: false,
      }),
    )

    return {
      kind: 'registration',
      reference: registrationRef,
      paid: false,
      updated: false,
      pending: parsed.dbPaymentStatus === 'pending',
      failed: parsed.dbPaymentStatus === 'failed',
      paymentState: parsed.primaryPaymentState,
      error: parsed.verificationError ?? undefined,
    }
  } catch (e: unknown) {
    const msg = stanbicVerificationErrorMessage(e)
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method: 'POST',
      registrationRef,
      registrationPayloadId,
      orderReference: orderRef,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: retrieveHttpFromStanbicError(e),
      verificationApproved: false,
      verificationError: msg,
      itemDescription: REGISTRATION_ITEM_DESCRIPTION,
      email: registration.email,
    })
    return {
      kind: 'registration',
      reference: registrationRef,
      paid: false,
      updated: false,
      pending: true,
      failed: false,
      error: msg,
    }
  }
}

export async function syncDonationWithStanbic(
  payload: Payload,
  donationHumanId: string,
): Promise<StanbicSyncResult> {
  if (!stanbicHostedPaymentsConfigured()) {
    return {
      kind: 'donation',
      reference: donationHumanId,
      paid: false,
      updated: false,
      pending: true,
      failed: false,
      error: 'gateway_not_configured',
    }
  }

  const found = await payload.find({
    collection: 'donations',
    where: { donationId: { equals: donationHumanId } },
    limit: 1,
    overrideAccess: true,
  })
  const donationDoc = found.docs[0] as Record<string, unknown> | undefined
  if (!donationDoc) {
    return {
      kind: 'donation',
      reference: donationHumanId,
      paid: false,
      updated: false,
      pending: false,
      failed: true,
      error: 'donation_not_found',
    }
  }

  const kind = donationKind(donationDoc)
  const reference =
    typeof donationDoc.donationId === 'string' ? donationDoc.donationId : donationHumanId
  const orderRef = hasStanbicRef(donationDoc)
  const itemDescription =
    typeof donationDoc.categoryDisplay === 'string'
      ? donationDoc.categoryDisplay
      : kind === 'sponsorship'
        ? 'SARSYC sponsorship'
        : 'SARSYC donation'

  if (donationDoc.paymentStatus === 'paid') {
    return {
      kind,
      reference,
      paid: true,
      updated: false,
      pending: false,
      failed: false,
      skipped: true,
    }
  }

  if (donationDoc.paymentMethod === 'bank-transfer') {
    return {
      kind,
      reference,
      paid: false,
      updated: false,
      pending: true,
      failed: false,
      skipped: true,
      error: 'bank_transfer_not_stanbic',
    }
  }

  if (!orderRef) {
    return {
      kind,
      reference,
      paid: false,
      updated: false,
      pending: true,
      failed: false,
      skipped: true,
      error: 'no_stanbic_order_ref',
    }
  }

  try {
    const verification = await verifyStanbicOrderReference(orderRef)
    const { parsed, retrieveHttpStatus } = verification
    const paid = parsed.verificationApproved
    let updated = false

    if (paid && donationDoc.paymentStatus !== 'paid') {
      await payload.update({
        collection: 'donations',
        id: String(donationDoc.id),
        data: {
          paymentStatus: 'paid',
          stanbicPaymentOrderRef: orderRef,
          paymentConfirmedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })
      updated = true
    } else if (
      !paid &&
      parsed.dbPaymentStatus === 'failed' &&
      donationDoc.paymentStatus === 'pending'
    ) {
      await payload.update({
        collection: 'donations',
        id: String(donationDoc.id),
        data: {
          paymentStatus: 'failed',
          stanbicPaymentOrderRef: orderRef,
        },
        overrideAccess: true,
      })
      updated = true
    }

    logStanbicPaymentEvent(
      buildStanbicReturnLogPayload({
        method: 'POST',
        registrationRef: reference,
        registrationPayloadId: String(donationDoc.id),
        orderReference: orderRef,
        itemDescription,
        email: donationDoc.email,
        verificationHttp: retrieveHttpStatus,
        parsed,
        dbPaymentStatusUpdated: updated,
      }),
    )

    return {
      kind,
      reference,
      paid,
      updated,
      pending: !paid && parsed.dbPaymentStatus === 'pending',
      failed: !paid && parsed.dbPaymentStatus === 'failed',
      paymentState: parsed.primaryPaymentState,
      error: parsed.verificationError ?? undefined,
    }
  } catch (e: unknown) {
    const msg = stanbicVerificationErrorMessage(e)
    logStanbicPaymentEvent({
      event: 'stanbic_return',
      method: 'POST',
      registrationRef: reference,
      registrationPayloadId: String(donationDoc.id),
      orderReference: orderRef,
      returnKind: 'error',
      success: false,
      paid: false,
      dbPaymentStatusUpdated: false,
      verificationHttp: retrieveHttpFromStanbicError(e),
      verificationApproved: false,
      verificationError: msg,
      itemDescription,
      email: donationDoc.email,
    })
    return {
      kind,
      reference,
      paid: false,
      updated: false,
      pending: true,
      failed: false,
      error: msg,
    }
  }
}

async function findRegistrationPayloadIdByRef(
  payload: Payload,
  reference: string,
): Promise<string | null> {
  const byHuman = await payload.find({
    collection: 'registrations',
    where: { registrationId: { equals: reference } },
    limit: 1,
    overrideAccess: true,
  })
  if (byHuman.docs[0]?.id != null) return String(byHuman.docs[0].id)

  try {
    await payload.findByID({ collection: 'registrations', id: reference, overrideAccess: true })
    return reference
  } catch {
    return null
  }
}

export async function syncPaymentReferenceWithStanbic(
  payload: Payload,
  reference: string,
): Promise<StanbicSyncResult> {
  const ref = reference.trim()
  if (!ref) {
    return {
      kind: 'registration',
      reference: ref,
      paid: false,
      updated: false,
      pending: false,
      failed: true,
      error: 'empty_reference',
    }
  }

  if (ref.toUpperCase().startsWith('SARSYC-DON-')) {
    return syncDonationWithStanbic(payload, ref)
  }

  const regPayloadId = await findRegistrationPayloadIdByRef(payload, ref)
  if (regPayloadId) {
    return syncRegistrationWithStanbic(payload, regPayloadId)
  }

  const donationByRef = await payload.find({
    collection: 'donations',
    where: { donationId: { equals: ref } },
    limit: 1,
    overrideAccess: true,
  })
  if (donationByRef.docs[0]) {
    const humanId =
      typeof donationByRef.docs[0].donationId === 'string'
        ? donationByRef.docs[0].donationId
        : ref
    return syncDonationWithStanbic(payload, humanId)
  }

  return {
    kind: 'registration',
    reference: ref,
    paid: false,
    updated: false,
    pending: false,
    failed: true,
    error: 'reference_not_found',
  }
}

export async function bulkSyncStanbicPayments(
  payload: Payload,
  options?: { references?: string[]; limit?: number },
): Promise<BulkStanbicSyncSummary> {
  if (!stanbicHostedPaymentsConfigured()) {
    return {
      ok: false,
      scanned: 0,
      newlyPaid: 0,
      stillPending: 0,
      failed: 0,
      skipped: 0,
      results: [],
      truncated: false,
      error: 'Stanbic hosted payments are not configured',
    }
  }

  await ensureRegistrationsLatestColumns(payload)

  const limit = Math.min(options?.limit ?? BULK_SYNC_LIMIT, BULK_SYNC_LIMIT)
  const results: StanbicSyncResult[] = []
  let truncated = false

  if (options?.references?.length) {
    const refs = options.references.slice(0, limit)
    truncated = options.references.length > limit
    for (const reference of refs) {
      results.push(await syncPaymentReferenceWithStanbic(payload, reference))
    }
  } else {
    const [regRes, donRes] = await Promise.all([
      payload.find({
        collection: 'registrations',
        where: { paymentStatus: { equals: 'pending' } },
        limit: 200,
        sort: '-updatedAt',
        overrideAccess: true,
      }),
      payload.find({
        collection: 'donations',
        where: {
          and: [
            { paymentStatus: { in: ['pending', 'failed'] } },
            { paymentMethod: { not_equals: 'bank-transfer' } },
          ],
        },
        limit: 200,
        sort: '-updatedAt',
        overrideAccess: true,
      }),
    ])

    const regTargets = (regRes.docs as Record<string, unknown>[]).filter((doc) => hasStanbicRef(doc))
    const donTargets = (donRes.docs as Record<string, unknown>[]).filter((doc) => hasStanbicRef(doc))

    const queue: Array<{ type: 'registration' | 'donation'; id: string }> = [
      ...regTargets.map((doc) => ({ type: 'registration' as const, id: String(doc.id) })),
      ...donTargets.map((doc) => ({
        type: 'donation' as const,
        id:
          typeof doc.donationId === 'string' ? doc.donationId : String(doc.id),
      })),
    ]

    truncated = queue.length > limit
    for (const item of queue.slice(0, limit)) {
      if (item.type === 'registration') {
        results.push(await syncRegistrationWithStanbic(payload, item.id))
      } else {
        results.push(await syncDonationWithStanbic(payload, item.id))
      }
    }
  }

  const newlyPaid = results.filter((r) => r.updated && r.paid).length
  const stillPending = results.filter((r) => r.pending && !r.paid && !r.skipped).length
  const failed = results.filter((r) => r.failed).length
  const skipped = results.filter((r) => r.skipped).length

  return {
    ok: true,
    scanned: results.length,
    newlyPaid,
    stillPending,
    failed,
    skipped,
    results,
    truncated,
  }
}
