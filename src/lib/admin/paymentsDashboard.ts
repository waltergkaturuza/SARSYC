import type { Payload } from 'payload'
import { registrationManualBankPaymentEnabled } from '@/lib/registrationBankTransfer'
import {
  paymentDueEmailAmount,
  registrationFeeUsd,
  registrationInactiveReason,
  registrationIsActive,
} from '@/lib/registrationResumePayment'

export type PaymentRowStatus =
  | 'paid'
  | 'unpaid'
  | 'waived'
  | 'failed'
  | 'bank-transfer'
  | 'pending'
  | 'cancelled'

export type PaymentRow = {
  id: string
  kind: 'registration' | 'donation'
  delegate: string
  email: string
  organisation: string
  feeUsd: number
  status: PaymentRowStatus
  statusLabel: string
  method: string
  date: string
  reference: string
  editHref: string
}

export type CardActivityRow = {
  id: string
  time: string
  step: string
  registrationRef: string
  verificationApproved: boolean | null
  dbPaymentStatusUpdated: boolean | null
  note: string
}

export type InvoiceCandidate = {
  payloadId: string
  registrationId: string
  delegate: string
  email: string
  organisation: string
  packageName: string | null
  feeUsd: number
  paymentStatus: string
  registrationStatus: string
  invoiceSentAt: string | null
  canSend: boolean
  ineligibleReason: string | null
}

export type PaymentsDashboardData = {
  stats: {
    totalExpectedUsd: number
    collectedUsd: number
    outstandingUsd: number
    registrationCount: number
    donationCount: number
    paidCount: number
    unpaidCount: number
    waivedCount: number
    failedCount: number
    partialCount: number
  }
  payments: PaymentRow[]
  invoiceCandidates: InvoiceCandidate[]
  cardActivity: CardActivityRow[]
  cardActivityNote: string | null
}

function registrationMethod(reg: Record<string, unknown>): string {
  if (registrationManualBankPaymentEnabled()) {
    return 'Bank transfer'
  }
  if (typeof reg.stanbicPaymentOrderRef === 'string' && reg.stanbicPaymentOrderRef.trim()) {
    return 'Credit / Debit Card (Stanbic)'
  }
  return 'Credit / Debit Card (Stanbic)'
}

function mapRegistrationStatus(reg: Record<string, unknown>): {
  status: PaymentRowStatus
  label: string
} {
  if (!registrationIsActive(reg)) {
    return { status: 'cancelled', label: 'Cancelled / deleted' }
  }
  const ps = reg.paymentStatus
  if (ps === 'paid') return { status: 'paid', label: 'Paid' }
  if (ps === 'waived') return { status: 'waived', label: 'Waived' }
  if (registrationManualBankPaymentEnabled()) {
    return { status: 'bank-transfer', label: 'Bank transfer pending' }
  }
  return { status: 'unpaid', label: 'Unpaid' }
}

function mapDonationStatus(doc: Record<string, unknown>): {
  status: PaymentRowStatus
  label: string
} {
  const ps = doc.paymentStatus
  if (ps === 'paid') return { status: 'paid', label: 'Paid' }
  if (ps === 'failed') return { status: 'failed', label: 'Failed' }
  if (ps === 'bank-transfer') return { status: 'bank-transfer', label: 'Bank transfer' }
  return { status: 'pending', label: 'Unpaid' }
}

export async function loadPaymentsDashboardData(
  payload: Payload,
): Promise<PaymentsDashboardData> {
  let registrations: Record<string, unknown>[] = []
  let donations: Record<string, unknown>[] = []
  let cardActivity: CardActivityRow[] = []
  let cardActivityNote: string | null = null

  try {
    const regRes = await payload.find({
      collection: 'registrations',
      limit: 1000,
      sort: '-createdAt',
      overrideAccess: true,
    })
    registrations = (regRes.docs || []) as Record<string, unknown>[]
  } catch (e) {
    console.error('[payments dashboard] registrations', e)
  }

  try {
    const donRes = await payload.find({
      collection: 'donations',
      limit: 1000,
      sort: '-createdAt',
      overrideAccess: true,
    })
    donations = (donRes.docs || []) as Record<string, unknown>[]
  } catch (e) {
    console.error('[payments dashboard] donations', e)
  }

  try {
    const evRes = await payload.find({
      collection: 'stanbic-payment-events',
      limit: 150,
      sort: '-createdAt',
      overrideAccess: true,
    })
    cardActivity = (evRes.docs || []).map((doc: Record<string, unknown>) => ({
      id: String(doc.id),
      time: doc.createdAt ? new Date(String(doc.createdAt)).toLocaleString() : '—',
      step: String(doc.event || '—'),
      registrationRef: String(doc.registrationRef || '—'),
      verificationApproved:
        doc.event === 'stanbic_start' || doc.event === 'stanbic_duplicate_attempt'
          ? null
          : doc.verificationApproved === true,
      dbPaymentStatusUpdated:
        doc.event === 'stanbic_start' || doc.event === 'stanbic_duplicate_attempt'
          ? null
          : doc.dbPaymentStatusUpdated === true,
      note:
        typeof doc.verificationError === 'string' && doc.verificationError.trim()
          ? doc.verificationError.trim()
          : typeof doc.paymentState === 'string' && doc.paymentState
            ? doc.paymentState
            : '—',
    }))
  } catch (e) {
    console.error('[payments dashboard] stanbic events', e)
    cardActivityNote =
      'Card activity table is not available yet — run the latest migration (stanbic_payment_events), then redeploy. New payments will appear here automatically.'
  }

  const regPayments: PaymentRow[] = registrations.map((reg) => {
    const fee = registrationFeeUsd(reg)
    const { status, label } = mapRegistrationStatus(reg)
    const first = typeof reg.firstName === 'string' ? reg.firstName : ''
    const last = typeof reg.lastName === 'string' ? reg.lastName : ''
    return {
      id: `reg-${reg.id}`,
      kind: 'registration',
      delegate: `${first} ${last}`.trim() || '—',
      email: typeof reg.email === 'string' ? reg.email : '—',
      organisation: typeof reg.organization === 'string' ? reg.organization : '—',
      feeUsd: fee,
      status,
      statusLabel: label,
      method: registrationMethod(reg),
      date: reg.createdAt ? new Date(String(reg.createdAt)).toLocaleDateString() : '—',
      reference: typeof reg.registrationId === 'string' ? reg.registrationId : String(reg.id),
      editHref: `/admin/registrations/${reg.id}`,
    }
  })

  const donPayments: PaymentRow[] = donations.map((doc) => {
    const { status, label } = mapDonationStatus(doc)
    const amount = Number(doc.amountUsd)
    return {
      id: `don-${doc.id}`,
      kind: 'donation',
      delegate: typeof doc.donorName === 'string' ? doc.donorName : '—',
      email: typeof doc.email === 'string' ? doc.email : '—',
      organisation:
        typeof doc.orgName === 'string' && doc.orgName
          ? doc.orgName
          : typeof doc.categoryDisplay === 'string'
            ? doc.categoryDisplay
            : doc.type === 'sponsorship'
              ? 'Sponsorship'
              : 'Donation',
      feeUsd: Number.isFinite(amount) ? amount : 0,
      status,
      statusLabel: label,
      method:
        doc.paymentMethod === 'bank-transfer'
          ? 'Bank transfer'
          : 'Credit / Debit Card (Stanbic)',
      date: doc.createdAt ? new Date(String(doc.createdAt)).toLocaleDateString() : '—',
      reference: typeof doc.donationId === 'string' ? doc.donationId : String(doc.id),
      editHref: `/admin/donations/${doc.id}`,
    }
  })

  const payments = [...regPayments, ...donPayments].sort((a, b) => {
    const ta = new Date(a.date).getTime()
    const tb = new Date(b.date).getTime()
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
  })

  let totalExpectedUsd = 0
  let collectedUsd = 0
  let paidCount = 0
  let unpaidCount = 0
  let waivedCount = 0
  let failedCount = 0

  for (const p of payments) {
    if (p.kind === 'registration' && p.status === 'waived') {
      waivedCount++
      continue
    }
    if (p.kind === 'registration' && p.status === 'cancelled') {
      continue
    }
    totalExpectedUsd += p.feeUsd
    if (p.status === 'paid') {
      collectedUsd += p.feeUsd
      paidCount++
    } else if (p.status === 'failed') {
      failedCount++
      unpaidCount++
    } else if (p.status === 'unpaid' || p.status === 'pending' || p.status === 'bank-transfer') {
      unpaidCount++
    }
  }

  const outstandingUsd = Math.max(0, totalExpectedUsd - collectedUsd)

  const invoiceCandidates: InvoiceCandidate[] = registrations.map((reg) => {
    const first = typeof reg.firstName === 'string' ? reg.firstName : ''
    const last = typeof reg.lastName === 'string' ? reg.lastName : ''
    const { packageName, amountUsd } = paymentDueEmailAmount(reg)
    const feeUsd = registrationFeeUsd(reg)
    const paymentStatus = typeof reg.paymentStatus === 'string' ? reg.paymentStatus : 'pending'
    const registrationStatus = typeof reg.status === 'string' ? reg.status : 'pending'
    const email = typeof reg.email === 'string' ? reg.email : ''
    const invoiceSentAt =
      reg.invoiceSentAt != null && reg.invoiceSentAt !== ''
        ? new Date(String(reg.invoiceSentAt)).toLocaleString()
        : null

    let canSend = true
    let ineligibleReason: string | null = null
    const inactiveReason = registrationInactiveReason(reg)
    if (inactiveReason) {
      canSend = false
      ineligibleReason = inactiveReason
    } else if (!email.trim()) {
      canSend = false
      ineligibleReason = 'No email'
    } else if (paymentStatus === 'waived') {
      canSend = false
      ineligibleReason = 'Fee waived'
    } else if (!packageName || amountUsd == null || amountUsd <= 0) {
      canSend = false
      ineligibleReason = 'No package or fee'
    }

    return {
      payloadId: String(reg.id),
      registrationId:
        typeof reg.registrationId === 'string' ? reg.registrationId : String(reg.id),
      delegate: `${first} ${last}`.trim() || '—',
      email: email || '—',
      organisation: typeof reg.organization === 'string' ? reg.organization : '—',
      packageName,
      feeUsd: feeUsd > 0 ? feeUsd : amountUsd ?? 0,
      paymentStatus,
      registrationStatus,
      invoiceSentAt,
      canSend,
      ineligibleReason,
    }
  })

  return {
    stats: {
      totalExpectedUsd,
      collectedUsd,
      outstandingUsd,
      registrationCount: registrations.filter((r) => registrationIsActive(r)).length,
      donationCount: donations.length,
      paidCount,
      unpaidCount,
      waivedCount,
      failedCount,
      partialCount: 0,
    },
    payments,
    invoiceCandidates,
    cardActivity,
    cardActivityNote,
  }
}

export function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
