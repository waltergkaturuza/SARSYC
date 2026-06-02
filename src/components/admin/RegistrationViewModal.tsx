'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiX,
  FiMail,
  FiPhone,
  FiCheck,
  FiLoader,
  FiEdit2,
  FiPaperclip,
} from 'react-icons/fi'
import { showToast } from '@/lib/toast'
import {
  getRegistrationPackage,
  getRegistrationPricingTier,
  isRegistrationPackageId,
  packageUsdForTier,
  registrationPackageDisplayName,
} from '@/lib/registrationPackages'
import { registrationManualBankPaymentEnabled } from '@/lib/registrationBankTransfer'
import RegistrationPaymentSync from '@/components/admin/RegistrationPaymentSync'
import { countries } from '@/lib/countries'
import {
  BLOOD_TYPE_OPTIONS,
  DIETARY_OPTIONS,
  EMERGENCY_RELATIONSHIP_OPTIONS,
  NATIONAL_ID_TYPE_OPTIONS,
  VISA_STATUS_OPTIONS,
  buildAdminRegistrationPatch,
} from '@/lib/admin/registrationAdminEdit'

type RegistrationDoc = Record<string, unknown>

const CATEGORY_LABELS: Record<string, string> = {
  student: 'Student / Youth Delegate',
  researcher: 'Young Researcher',
  policymaker: 'Policymaker / Government Official',
  partner: 'Development Partner',
  observer: 'Observer',
}

const STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

const PAYMENT_OPTIONS = [
  { value: 'pending', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'waived', label: 'Waived' },
] as const

const COUNTRY_LABELS = Object.fromEntries(countries.map((c) => [c.value, c.label]))

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  'prefer-not-to-say': 'Prefer not to say',
}

const SECURITY_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  cleared: 'Cleared',
  flagged: 'Flagged',
}

type Props = {
  registrationId: string | null
  onClose: () => void
}

function initials(first?: string, last?: string): string {
  const a = (first?.trim()?.[0] || '').toUpperCase()
  const b = (last?.trim()?.[0] || '').toUpperCase()
  return a + b || '?'
}

function countryLabel(value: unknown): string {
  if (!value) return '—'
  return COUNTRY_LABELS[String(value)] || String(value)
}

function optionLabel(
  value: unknown,
  options: readonly { value: string; label: string }[],
): string {
  if (!value) return '—'
  const found = options.find((o) => o.value === String(value))
  return found?.label || String(value)
}

function formatDate(value: unknown): string {
  if (!value) return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB')
}

function formatDateTime(value: unknown): string {
  if (!value) return '—'
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString('en-GB')
}

function formatYesNo(value: unknown): string {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return '—'
}

function formatDietary(value: unknown): string {
  if (!value) return 'None'
  const raw = Array.isArray(value)
    ? value
    : typeof value === 'string' && value
      ? [value]
      : []
  const items = raw
    .map((v) => optionLabel(v, DIETARY_OPTIONS))
    .filter((label) => label !== '—')
  return items.length ? items.join(', ') : 'None'
}

function registrationFeeUsd(reg: RegistrationDoc): number {
  if (reg.paymentStatus === 'waived') return 0
  const pkg = reg.registrationPackage
  if (!isRegistrationPackageId(pkg)) return 0
  const tier = getRegistrationPricingTier(
    reg.createdAt ? new Date(String(reg.createdAt)) : new Date(),
  )
  return packageUsdForTier(getRegistrationPackage(pkg), tier)
}

function paymentMethodLabel(reg: RegistrationDoc): string {
  if (registrationManualBankPaymentEnabled()) return 'Bank transfer'
  if (typeof reg.stanbicPaymentOrderRef === 'string' && reg.stanbicPaymentOrderRef.trim()) {
    return 'Credit / Debit Card (Stanbic)'
  }
  return 'Credit / Debit Card (Stanbic)'
}

function passportScanUrl(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'object' && value !== null && 'url' in value) {
    const url = (value as { url?: unknown }).url
    if (typeof url === 'string' && url.trim()) return url.trim()
  }
  return null
}

export default function RegistrationViewModal({ registrationId, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [doc, setDoc] = useState<RegistrationDoc | null>(null)
  const [status, setStatus] = useState('pending')
  const [paymentStatus, setPaymentStatus] = useState('pending')
  const [notes, setNotes] = useState('')

  const loadRegistration = useCallback(async () => {
    if (!registrationId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || !data.doc) {
        throw new Error(data.error || 'Could not load registration')
      }
      const reg = data.doc as RegistrationDoc
      setDoc(reg)
      setStatus(String(reg.status || 'pending'))
      setPaymentStatus(String(reg.paymentStatus || 'pending'))
      setNotes(typeof reg.notes === 'string' ? reg.notes : '')
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : 'Failed to load registration')
      onClose()
    } finally {
      setLoading(false)
    }
  }, [registrationId, onClose])

  useEffect(() => {
    if (registrationId) {
      void loadRegistration()
    } else {
      setDoc(null)
    }
  }, [registrationId, loadRegistration])

  useEffect(() => {
    if (!registrationId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [registrationId, onClose])

  const feeUsd = useMemo(() => (doc ? registrationFeeUsd(doc) : 0), [doc])

  const handleSave = async () => {
    if (!doc || !registrationId) return
    setSaving(true)
    try {
      const payload = buildAdminRegistrationPatch({
        ...doc,
        status,
        paymentStatus,
        notes,
      })
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      showToast.success('Registration updated')
      router.refresh()
      onClose()
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleEmail = async () => {
    if (!registrationId) return
    setEmailing(true)
    try {
      const res = await fetch('/api/admin/registrations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'sendEmail', ids: [registrationId] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Email failed')
      showToast.success('Confirmation email queued')
    } catch (e: unknown) {
      showToast.error(e instanceof Error ? e.message : 'Could not send email')
    } finally {
      setEmailing(false)
    }
  }

  if (!registrationId) return null

  const firstName = doc ? String(doc.firstName || '') : ''
  const lastName = doc ? String(doc.lastName || '') : ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Delegate'
  const orgLine = [doc?.organizationPosition, doc?.organization].filter(Boolean).join(' — ')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-700/80 bg-[#121c2e] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-700/80 px-6 py-5 shrink-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#121c2e] font-bold text-lg shrink-0 shadow-lg shadow-amber-900/30">
              {loading ? '…' : initials(firstName, lastName)}
            </div>
            <div className="min-w-0">
              <h2 id="registration-modal-title" className="text-xl font-bold text-white truncate">
                {loading ? 'Loading…' : fullName}
              </h2>
              {orgLine ? (
                <p className="text-sm text-slate-400 mt-0.5 truncate">{orgLine}</p>
              ) : null}
              {doc?.registrationId ? (
                <p className="text-xs font-mono text-amber-400/90 mt-2">{String(doc.registrationId)}</p>
              ) : null}
              {registrationId ? (
                <p className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">{registrationId}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <FiX size={22} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <FiLoader className="animate-spin mr-2" size={24} />
            Loading registration…
          </div>
        ) : doc ? (
          <>
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  <DetailCard title="Personal information">
                    <DetailRow icon={FiMail} label="Email" value={doc.email} />
                    <DetailRow icon={FiPhone} label="Phone" value={doc.phone} />
                    <DetailRow label="Date of birth" value={formatDate(doc.dateOfBirth)} />
                    <DetailRow
                      label="Gender"
                      value={doc.gender ? GENDER_LABELS[String(doc.gender)] || doc.gender : '—'}
                    />
                    <DetailRow label="Country of residence" value={countryLabel(doc.country)} />
                    <DetailRow label="Nationality" value={countryLabel(doc.nationality)} />
                    <DetailRow label="City" value={doc.city} />
                    <DetailRow label="Address" value={doc.address} multiline />
                    <DetailRow label="Organization" value={doc.organization} />
                    <DetailRow label="Position / title" value={doc.organizationPosition} />
                  </DetailCard>

                  <DetailCard title="Conference registration">
                    <DetailRow label="Package" value={registrationPackageDisplayName(
                      typeof doc.registrationPackage === 'string' ? doc.registrationPackage : undefined,
                    )} />
                    <DetailRow
                      label="Category"
                      value={CATEGORY_LABELS[String(doc.category)] || doc.category}
                    />
                    <DetailRow
                      label="T-shirt size"
                      value={doc.tshirtSize ? String(doc.tshirtSize).toUpperCase() : '—'}
                    />
                    <DetailRow label="Dietary restrictions" value={formatDietary(doc.dietaryRestrictions)} />
                    <DetailRow label="Accessibility requirements" value={doc.accessibilityNeeds} multiline />
                    <DetailRow
                      label="Registered"
                      value={doc.createdAt ? formatDate(doc.createdAt) : '—'}
                    />
                  </DetailCard>

                  <DetailCard title="International / ID">
                    <DetailRow label="International attendee" value={formatYesNo(doc.isInternational)} />
                    {doc.isInternational ? (
                      <>
                        <DetailRow label="Passport number" value={doc.passportNumber} />
                        <DetailRow label="Passport expiry" value={formatDate(doc.passportExpiry)} />
                        <DetailRow
                          label="Passport issuing country"
                          value={countryLabel(doc.passportIssuingCountry)}
                        />
                        <DetailRow label="Visa required" value={formatYesNo(doc.visaRequired)} />
                        <DetailRow
                          label="Visa status"
                          value={optionLabel(doc.visaStatus, VISA_STATUS_OPTIONS)}
                        />
                        <DetailRow
                          label="Visa application date"
                          value={formatDate(doc.visaApplicationDate)}
                        />
                        <DetailRow label="Visa number" value={doc.visaNumber} />
                        <DetailRow
                          label="Visa invitation letter"
                          value={formatYesNo(doc.visaInvitationLetterRequired !== false)}
                        />
                        {passportScanUrl(doc.passportScan) ? (
                          <div className="flex justify-between gap-4 py-2 text-sm border-b border-slate-700/40">
                            <span className="text-slate-500 shrink-0">Passport scan</span>
                            <a
                              href={passportScanUrl(doc.passportScan)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-right"
                            >
                              <FiPaperclip size={14} />
                              View file
                            </a>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <DetailRow label="National ID number" value={doc.nationalIdNumber} />
                        <DetailRow
                          label="ID type"
                          value={optionLabel(doc.nationalIdType, NATIONAL_ID_TYPE_OPTIONS)}
                        />
                      </>
                    )}
                  </DetailCard>

                  <DetailCard title="Emergency contact">
                    <DetailRow label="Full name" value={doc.emergencyContactName} />
                    <DetailRow
                      label="Relationship"
                      value={optionLabel(doc.emergencyContactRelationship, EMERGENCY_RELATIONSHIP_OPTIONS)}
                    />
                    <DetailRow label="Phone" value={doc.emergencyContactPhone} />
                    <DetailRow label="Email" value={doc.emergencyContactEmail} />
                    <DetailRow label="Home address" value={doc.emergencyContactAddress} multiline />
                    <DetailRow label="Country" value={countryLabel(doc.emergencyContactCountry)} />
                    <DetailRow label="City" value={doc.emergencyContactCity} />
                    <DetailRow label="Postal / ZIP" value={doc.emergencyContactPostalCode} />
                  </DetailCard>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                  <DetailCard title="Travel & accommodation">
                    <DetailRow label="Arrival date" value={formatDate(doc.arrivalDate)} />
                    <DetailRow label="Departure date" value={formatDate(doc.departureDate)} />
                    <DetailRow label="Flight number" value={doc.flightNumber} />
                    {doc.isInternational ? (
                      <>
                        <DetailRow label="Travel insurance provider" value={doc.travelInsuranceProvider} />
                        <DetailRow
                          label="Travel insurance policy"
                          value={doc.travelInsurancePolicyNumber}
                        />
                        <DetailRow
                          label="Travel insurance expiry"
                          value={formatDate(doc.travelInsuranceExpiry)}
                        />
                      </>
                    ) : null}
                    <DetailRow
                      label="Accommodation assistance"
                      value={
                        doc.accommodationRequired
                          ? doc.accommodationPreferences || 'Requested'
                          : 'Self-arranged'
                      }
                      multiline={Boolean(doc.accommodationRequired && doc.accommodationPreferences)}
                    />
                  </DetailCard>

                  <DetailCard title="Health & medical">
                    <DetailRow label="Has health insurance" value={formatYesNo(doc.hasHealthInsurance)} />
                    {doc.hasHealthInsurance ? (
                      <>
                        <DetailRow label="Insurance provider" value={doc.insuranceProvider} />
                        <DetailRow label="Policy number" value={doc.insurancePolicyNumber} />
                      </>
                    ) : null}
                    <DetailRow
                      label="Blood type"
                      value={optionLabel(doc.bloodType, BLOOD_TYPE_OPTIONS)}
                    />
                    <DetailRow label="Medical conditions / allergies" value={doc.medicalConditions} multiline />
                  </DetailCard>

                  <DetailCard title="Payment">
                    <p className="text-2xl font-bold text-white mb-1">
                      {doc.paymentStatus === 'waived'
                        ? 'Waived'
                        : feeUsd > 0
                          ? `USD ${feeUsd.toLocaleString('en-US')}`
                          : '—'}
                    </p>
                    <p className="text-sm text-slate-400 mb-3">{paymentMethodLabel(doc)}</p>
                    {typeof doc.stanbicPaymentOrderRef === 'string' && doc.stanbicPaymentOrderRef.trim() ? (
                      <p className="text-xs font-mono text-slate-500 mb-4 break-all">
                        Order ref: {doc.stanbicPaymentOrderRef}
                      </p>
                    ) : null}
                    <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5">
                      Payment status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full rounded-lg border border-slate-600 bg-slate-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      {PAYMENT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {(paymentStatus === 'pending' || paymentStatus === 'failed') && (
                      <div className="mt-3">
                        <RegistrationPaymentSync
                          registrationPayloadId={registrationId}
                          paymentStatus={paymentStatus}
                          variant="dark"
                        />
                      </div>
                    )}
                  </DetailCard>

                  <section>
                    <SectionLabel>Registration status</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStatus(opt.value)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            status === opt.value
                              ? 'border-amber-400 text-amber-300 bg-amber-400/10 shadow-sm shadow-amber-900/20'
                              : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <DetailCard title="Safeguarding & security">
                    <DetailRow
                      label="Safeguarding"
                      value={
                        doc.safeguardingAcknowledgedAt
                          ? `Complete (${formatDateTime(doc.safeguardingAcknowledgedAt)})`
                          : doc.paymentStatus === 'paid' || doc.paymentStatus === 'waived'
                            ? 'Pending'
                            : 'N/A until paid'
                      }
                    />
                    <DetailRow
                      label="Security check"
                      value={
                        doc.securityCheckStatus
                          ? SECURITY_STATUS_LABELS[String(doc.securityCheckStatus)] ||
                            String(doc.securityCheckStatus).replace(/-/g, ' ')
                          : '—'
                      }
                    />
                    <DetailRow label="Security check notes" value={doc.securityCheckNotes} multiline />
                  </DetailCard>

                  <section>
                    <SectionLabel>Admin notes</SectionLabel>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={6}
                      placeholder="Internal notes (not visible to delegate)"
                      className="w-full rounded-xl border border-slate-600 bg-slate-900/60 text-slate-200 text-sm px-4 py-3 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-y min-h-[120px]"
                    />
                  </section>

                  <Link
                    href={`/admin/registrations/${registrationId}/edit`}
                    className="inline-flex items-center gap-2 text-sm text-amber-400/90 hover:text-amber-300 transition-colors"
                    onClick={onClose}
                  >
                    <FiEdit2 size={16} />
                    Open full edit form
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-700/80 px-6 py-4 flex flex-col sm:flex-row gap-3 bg-[#0f1729]">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || emailing}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#121c2e] font-semibold py-3 px-4 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 transition-all shadow-lg shadow-amber-900/25"
              >
                {saving ? <FiLoader className="animate-spin" /> : <FiCheck />}
                Save changes
              </button>
              <button
                type="button"
                onClick={handleEmail}
                disabled={saving || emailing}
                className="sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-sky-600/60 bg-sky-950/40 text-sky-300 font-medium py-3 px-6 hover:bg-sky-900/40 disabled:opacity-60 transition-colors"
              >
                {emailing ? <FiLoader className="animate-spin" /> : <FiMail />}
                Email
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-[0.2em] text-amber-400/85 mb-3 uppercase">
      {children}
    </h3>
  )
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
      <SectionLabel>{title}</SectionLabel>
      <div className="space-y-0">{children}</div>
    </section>
  )
}

function DetailRow({
  label,
  value,
  icon: Icon,
  multiline,
}: {
  label: string
  value: unknown
  icon?: React.ComponentType<{ className?: string; size?: number }>
  multiline?: boolean
}) {
  const display =
    value === null || value === undefined || value === '' ? '—' : String(value)
  return (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-slate-700/40 last:border-0">
      <span className="text-slate-500 shrink-0 flex items-center gap-2">
        {Icon ? <Icon className="text-amber-400/80 shrink-0" size={14} /> : null}
        {label}
      </span>
      <span
        className={`text-slate-100 text-right ${multiline ? 'whitespace-pre-wrap max-w-[60%]' : ''}`}
      >
        {display}
      </span>
    </div>
  )
}
