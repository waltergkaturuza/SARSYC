/**
 * Temporary manual bank transfer while Stanbic hosted payments are unavailable.
 * Set REGISTRATION_MANUAL_BANK_PAYMENT=false on Vercel to re-enable card payments.
 */

import {
  getRegistrationPricingTier,
  getRegistrationPackage,
  packageUsdForTier,
  type RegistrationPackageId,
} from '@/lib/registrationPackages'

function registrationFeeMinorUnitsOverride(): number {
  const raw = process.env.REGISTRATION_FEE_MINOR_UNITS?.trim()
  if (!raw) return 0
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export const REGISTRATION_BANK_PROOF_EMAILS = [
  'melisa@saywhat.org.zw',
  'isabella@saywhat.org.zw',
] as const

/** General registration and conference queries (replaces registration@sarsyc.org). */
export const REGISTRATION_CONTACT_EMAIL = 'researchunit@saywhat.org.zw'

export const REGISTRATION_SUPPORT_EMAILS = [
  REGISTRATION_CONTACT_EMAIL,
  ...REGISTRATION_BANK_PROOF_EMAILS,
] as const

export function formatRegistrationSupportContactsText(): string {
  const list = [...REGISTRATION_SUPPORT_EMAILS]
  if (list.length === 1) return list[0]
  return `${list.slice(0, -1).join(', ')} or ${list[list.length - 1]}`
}

export function formatRegistrationSupportContactsHtml(): string {
  return REGISTRATION_SUPPORT_EMAILS.map((email, i) => {
    const link = `<a href="mailto:${email}">${email}</a>`
    if (i === 0) return link
    if (i === REGISTRATION_SUPPORT_EMAILS.length - 1) return ` or ${link}`
    return `, ${link}`
  }).join('')
}

export const SARSYC_BANK_TRANSFER_DETAILS = {
  bankName: 'Stanbic Bank Zimbabwe',
  accountName: 'SAYWHAT',
  accountNumber: '9140006229661',
  branchName: 'Minerva',
  swiftCode: 'SBICZWHX',
  currency: 'USD',
  intermediaryBankName: 'Standard Bank of South Africa',
  intermediarySwiftCode: 'SBZAZAJJXXX',
} as const

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** True when card/hosted Stanbic flow is off and delegates pay by bank transfer. */
export function registrationManualBankPaymentEnabled(): boolean {
  const v = process.env.REGISTRATION_MANUAL_BANK_PAYMENT?.trim().toLowerCase()
  if (v === 'false' || v === '0' || v === 'no') return false
  if (v === 'true' || v === '1' || v === 'yes') return true
  return true
}

/** Fee is due for the current pricing window (independent of hosted vs manual). */
export function registrationFeePaymentDue(): boolean {
  const tier = getRegistrationPricingTier()
  if (tier === 'closed') return false
  if (registrationFeeMinorUnitsOverride() > 0) return true
  return tier === 'early' || tier === 'late'
}

export function registrationPackageAmountUsd(packageId: RegistrationPackageId): number {
  const tier = getRegistrationPricingTier()
  const pkg = getRegistrationPackage(packageId)
  return packageUsdForTier(pkg, tier)
}

export function formatRegistrationBankTransferText(params: {
  registrationId: string
  packageName: string
  amountUsd: number
}): string {
  const { registrationId, packageName, amountUsd } = params
  const b = SARSYC_BANK_TRANSFER_DETAILS
  const proof = REGISTRATION_BANK_PROOF_EMAILS.join(' and ')

  return [
    'BANK TRANSFER — REGISTRATION FEE',
    '',
    `Package: ${packageName}`,
    `Amount: USD ${amountUsd.toFixed(2)}`,
    `Payment reference: ${registrationId} (include on your deposit)`,
    '',
    `Bank: ${b.bankName}`,
    `Account name: ${b.accountName}`,
    `Account number: ${b.accountNumber}`,
    `Branch: ${b.branchName}`,
    `SWIFT: ${b.swiftCode}`,
    `Currency: ${b.currency}`,
    `Intermediary bank: ${b.intermediaryBankName}`,
    `Intermediary SWIFT: ${b.intermediarySwiftCode}`,
    '',
    `After paying, email proof of payment to ${proof}, with your registration ID and full name.`,
  ].join('\n')
}

export function formatRegistrationBankTransferHtml(params: {
  registrationId: string
  packageName: string
  amountUsd: number
}): string {
  const { registrationId, packageName, amountUsd } = params
  const b = SARSYC_BANK_TRANSFER_DETAILS
  const proofList = REGISTRATION_BANK_PROOF_EMAILS.map(
    (e) => `<a href="mailto:${e}">${escapeHtml(e)}</a>`,
  ).join(' and ')

  const box =
    'margin:1.25rem 0;padding:1rem;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;'

  return [
    `<div style="${box}">`,
    '<p style="margin:0 0 0.75rem;font-weight:600;">Bank transfer — registration fee</p>',
    `<p style="margin:0 0 0.5rem;">Package: <strong>${escapeHtml(packageName)}</strong></p>`,
    `<p style="margin:0 0 0.75rem;">Amount to pay: <strong>USD ${amountUsd.toFixed(2)}</strong></p>`,
    `<p style="margin:0 0 0.75rem;"><strong>Reference:</strong> use registration ID <strong>${escapeHtml(registrationId)}</strong> on the deposit.</p>`,
    '<table style="width:100%;border-collapse:collapse;font-size:14px;">',
    `<tr><td style="padding:4px 8px 4px 0;color:#4b5563;">Bank</td><td>${escapeHtml(b.bankName)}</td></tr>`,
    `<tr><td style="padding:4px 8px 4px 0;color:#4b5563;">Account name</td><td>${escapeHtml(b.accountName)}</td></tr>`,
    `<tr><td style="padding:4px 8px 4px 0;color:#4b5563;">Account number</td><td><strong>${escapeHtml(b.accountNumber)}</strong></td></tr>`,
    `<tr><td style="padding:4px 8px 4px 0;color:#4b5563;">Branch</td><td>${escapeHtml(b.branchName)}</td></tr>`,
    `<tr><td style="padding:4px 8px 4px 0;color:#4b5563;">SWIFT</td><td>${escapeHtml(b.swiftCode)}</td></tr>`,
    `<tr><td style="padding:4px 8px 4px 0;color:#4b5563;">Currency</td><td>${escapeHtml(b.currency)}</td></tr>`,
    `<tr><td style="padding:4px 8px 4px 0;color:#4b5563;vertical-align:top;">Intermediary bank</td><td>${escapeHtml(b.intermediaryBankName)}<br/>SWIFT: ${escapeHtml(b.intermediarySwiftCode)}</td></tr>`,
    '</table>',
    `<p style="margin:0.75rem 0 0;">After paying, email <strong>proof of payment</strong> to ${proofList}, including your registration ID and full name.</p>`,
    '</div>',
  ].join('')
}
