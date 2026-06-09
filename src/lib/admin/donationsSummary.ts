import type { Payload } from 'payload'

export type DonationBreakdown = {
  recordCount: number
  paidCount: number
  unpaidCount: number
  failedCount: number
  bankTransferCount: number
  totalExpectedUsd: number
  collectedUsd: number
  outstandingUsd: number
  failedUsd: number
  bankTransferUsd: number
}

export function donationAmountUsd(doc: Record<string, unknown>): number {
  const n = Number(doc.amountUsd)
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function summarizeDonations(docs: Record<string, unknown>[]): DonationBreakdown {
  let paidCount = 0
  let unpaidCount = 0
  let failedCount = 0
  let bankTransferCount = 0
  let totalExpectedUsd = 0
  let collectedUsd = 0
  let failedUsd = 0
  let bankTransferUsd = 0

  for (const doc of docs) {
    const amount = donationAmountUsd(doc)
    totalExpectedUsd += amount
    const ps = doc.paymentStatus

    if (ps === 'paid') {
      paidCount++
      collectedUsd += amount
    } else if (ps === 'failed') {
      failedCount++
      failedUsd += amount
      unpaidCount++
    } else if (ps === 'bank-transfer') {
      bankTransferCount++
      bankTransferUsd += amount
      unpaidCount++
    } else {
      unpaidCount++
    }
  }

  const outstandingUsd = Math.max(0, totalExpectedUsd - collectedUsd)

  return {
    recordCount: docs.length,
    paidCount,
    unpaidCount,
    failedCount,
    bankTransferCount,
    totalExpectedUsd,
    collectedUsd,
    outstandingUsd,
    failedUsd,
    bankTransferUsd,
  }
}

/** Load all donations matching `where` (paginated) for summary totals. */
export async function fetchDonationsForSummary(
  payload: Payload,
  where: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = []
  let page = 1

  for (;;) {
    const res = await payload.find({
      collection: 'donations',
      where,
      limit: 250,
      page,
      depth: 0,
      overrideAccess: true,
    })
    all.push(...((res.docs || []) as Record<string, unknown>[]))
    if (!res.hasNextPage || res.docs.length === 0) break
    page += 1
    if (page > 200) break
  }

  return all
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
