'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiLoader } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { showToast } from '@/lib/toast'
import {
  EditField,
  EditSection,
  StatusPills,
  delegateInitials,
  editCheckLabel,
  editCheckbox,
  editInput,
} from '@/components/admin/registrationAdminUi'
import {
  REGISTRATION_PACKAGE_OPTIONS,
  PARTICIPATION_CATEGORIES,
  TSHIRT_SIZES,
  DIETARY_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  EMERGENCY_RELATIONSHIP_OPTIONS,
  NATIONAL_ID_TYPE_OPTIONS,
  VISA_STATUS_OPTIONS,
  buildAdminRegistrationPatch,
  normalizeRegistrationForm,
} from '@/lib/admin/registrationAdminEdit'

type FormState = Record<string, unknown>

export default function EditRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState | null>(null)

  useEffect(() => {
    fetch(`/api/admin/registrations/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.doc) {
          setForm(normalizeRegistrationForm(data.doc as Record<string, unknown>))
        } else {
          setForm(null)
        }
        setLoading(false)
      })
      .catch(() => {
        showToast.error('Failed to load registration')
        setLoading(false)
      })
  }, [id])

  const set = (field: string, value: unknown) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))

  const toggleDietary = (value: string) => {
    setForm((prev) => {
      if (!prev) return prev
      const current = Array.isArray(prev.dietaryRestrictions)
        ? (prev.dietaryRestrictions as string[])
        : []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, dietaryRestrictions: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return

    if (!form.registrationPackage) {
      showToast.error('Conference package is required')
      return
    }
    if (!form.category) {
      showToast.error('Participation category is required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(buildAdminRegistrationPatch(form)),
      })
      const data = await res.json()
      if (res.ok) {
        showToast.success('Registration updated successfully')
        router.push('/admin/registrations')
      } else {
        showToast.error(data.error || 'Failed to update registration')
      }
    } catch {
      showToast.error('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px] text-slate-400">
        <FiLoader className="w-8 h-8 animate-spin text-amber-400 mr-2" />
        Loading registration…
      </div>
    )
  }

  if (!form) {
    return (
      <div className="p-8 text-center text-slate-500 rounded-2xl border border-slate-700 bg-[#121c2e]">
        Registration not found.
      </div>
    )
  }

  const isInternational = Boolean(form.isInternational)
  const dietary = Array.isArray(form.dietaryRestrictions)
    ? (form.dietaryRestrictions as string[])
    : []
  const firstName = String(form.firstName || '')
  const lastName = String(form.lastName || '')

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 pb-28">
      <Link
        href="/admin/registrations"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-400 text-sm mb-5 transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Registrations
      </Link>

      <div className="rounded-2xl border border-slate-700/80 bg-[#121c2e] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-700/80 px-6 py-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#121c2e] font-bold text-lg shrink-0 shadow-lg shadow-amber-900/30">
            {delegateInitials(firstName, lastName)}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Edit Registration</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {String(form.firstName || '')} {String(form.lastName || '')}
            </p>
            {form.registrationId ? (
              <p className="text-xs font-mono text-amber-400/90 mt-2">{String(form.registrationId)}</p>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" style={{ colorScheme: 'dark' }}>
        <EditSection title="Personal Information">
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="First Name *">
              <input className={editInput} value={String(form.firstName || '')} onChange={(e) => set('firstName', e.target.value)} required />
            </EditField>
            <EditField label="Last Name *">
              <input className={editInput} value={String(form.lastName || '')} onChange={(e) => set('lastName', e.target.value)} required />
            </EditField>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="Email *">
              <input className={editInput} type="email" value={String(form.email || '')} onChange={(e) => set('email', e.target.value)} required />
            </EditField>
            <EditField label="Phone">
              <input className={editInput} value={String(form.phone || '')} onChange={(e) => set('phone', e.target.value)} />
            </EditField>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="Date of Birth">
              <input className={editInput} type="date" value={dateValue(form.dateOfBirth)} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </EditField>
            <EditField label="Gender">
              <select className={editInput} value={String(form.gender || '')} onChange={(e) => set('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </EditField>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="Country of Residence">
              <select className={editInput} value={String(form.country || '')} onChange={(e) => set('country', e.target.value)}>
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </EditField>
            <EditField label="Nationality">
              <select className={editInput} value={String(form.nationality || '')} onChange={(e) => set('nationality', e.target.value)}>
                <option value="">Select nationality</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </EditField>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="City">
              <input className={editInput} value={String(form.city || '')} onChange={(e) => set('city', e.target.value)} />
            </EditField>
            <EditField label="Address">
              <textarea className={editInput} rows={2} value={String(form.address || '')} onChange={(e) => set('address', e.target.value)} />
            </EditField>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="Organization / Institution">
              <input className={editInput} value={String(form.organization || '')} onChange={(e) => set('organization', e.target.value)} />
            </EditField>
            <EditField label="Position / Title">
              <input className={editInput} value={String(form.organizationPosition || '')} onChange={(e) => set('organizationPosition', e.target.value)} />
            </EditField>
          </div>
        </EditSection>

        <EditSection title="Conference Registration">
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="Conference package *">
              <select
                className={editInput}
                value={String(form.registrationPackage || '')}
                onChange={(e) => set('registrationPackage', e.target.value)}
                required
              >
                <option value="">Select package</option>
                {REGISTRATION_PACKAGE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </EditField>
            <EditField label="Participation category *">
              <select className={editInput} value={String(form.category || '')} onChange={(e) => set('category', e.target.value)} required>
                <option value="">Select category</option>
                {PARTICIPATION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </EditField>
            <EditField label="T-Shirt Size">
              <select className={editInput} value={String(form.tshirtSize || '')} onChange={(e) => set('tshirtSize', e.target.value)}>
                <option value="">Select size</option>
                {TSHIRT_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </EditField>
          </div>

          <EditField label="Dietary restrictions">
            <div className="flex flex-wrap gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option.value} className={editCheckLabel}>
                  <input
                    type="checkbox"
                    checked={dietary.includes(option.value)}
                    onChange={() => toggleDietary(option.value)}
                    className={editCheckbox}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </EditField>

          <EditField label="Accessibility requirements">
            <textarea className={editInput} rows={2} value={String(form.accessibilityNeeds || '')} onChange={(e) => set('accessibilityNeeds', e.target.value)} />
          </EditField>
        </EditSection>

        <EditSection title="International / ID">
          <label className={`${editCheckLabel} mb-4`}>
            <input
              type="checkbox"
              checked={isInternational}
              onChange={(e) => set('isInternational', e.target.checked)}
              className={editCheckbox}
            />
            International attendee
          </label>

          {isInternational ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <EditField label="Passport number">
                  <input className={editInput} value={String(form.passportNumber || '')} onChange={(e) => set('passportNumber', e.target.value)} />
                </EditField>
                <EditField label="Passport expiry">
                  <input className={editInput} type="date" value={dateValue(form.passportExpiry)} onChange={(e) => set('passportExpiry', e.target.value)} />
                </EditField>
              </div>
              <EditField label="Passport issuing country">
                <select className={editInput} value={String(form.passportIssuingCountry || '')} onChange={(e) => set('passportIssuingCountry', e.target.value)}>
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </EditField>
              <label className={editCheckLabel}>
                <input type="checkbox" checked={Boolean(form.visaRequired)} onChange={(e) => set('visaRequired', e.target.checked)} className={editCheckbox} />
                Visa required
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <EditField label="Visa status">
                  <select className={editInput} value={String(form.visaStatus || '')} onChange={(e) => set('visaStatus', e.target.value)}>
                    <option value="">Select</option>
                    {VISA_STATUS_OPTIONS.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </EditField>
                <EditField label="Visa application date">
                  <input className={editInput} type="date" value={dateValue(form.visaApplicationDate)} onChange={(e) => set('visaApplicationDate', e.target.value)} />
                </EditField>
                <EditField label="Visa number">
                  <input className={editInput} value={String(form.visaNumber || '')} onChange={(e) => set('visaNumber', e.target.value)} />
                </EditField>
              </div>
              <label className={editCheckLabel}>
                <input
                  type="checkbox"
                  checked={form.visaInvitationLetterRequired !== false}
                  onChange={(e) => set('visaInvitationLetterRequired', e.target.checked)}
                  className={editCheckbox}
                />
                Requires visa invitation letter
              </label>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <EditField label="National ID number">
                <input className={editInput} value={String(form.nationalIdNumber || '')} onChange={(e) => set('nationalIdNumber', e.target.value)} />
              </EditField>
              <EditField label="ID type">
                <select className={editInput} value={String(form.nationalIdType || '')} onChange={(e) => set('nationalIdType', e.target.value)}>
                  <option value="">Select</option>
                  {NATIONAL_ID_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </EditField>
            </div>
          )}
        </EditSection>

        <EditSection title="Emergency contact (next of kin)">
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="Full name">
              <input className={editInput} value={String(form.emergencyContactName || '')} onChange={(e) => set('emergencyContactName', e.target.value)} />
            </EditField>
            <EditField label="Relationship">
              <select className={editInput} value={String(form.emergencyContactRelationship || '')} onChange={(e) => set('emergencyContactRelationship', e.target.value)}>
                <option value="">Select</option>
                {EMERGENCY_RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </EditField>
            <EditField label="Phone">
              <input className={editInput} value={String(form.emergencyContactPhone || '')} onChange={(e) => set('emergencyContactPhone', e.target.value)} />
            </EditField>
            <EditField label="Email">
              <input className={editInput} type="email" value={String(form.emergencyContactEmail || '')} onChange={(e) => set('emergencyContactEmail', e.target.value)} />
            </EditField>
          </div>
          <EditField label="Home address">
            <textarea className={editInput} rows={2} value={String(form.emergencyContactAddress || '')} onChange={(e) => set('emergencyContactAddress', e.target.value)} />
          </EditField>
          <div className="grid md:grid-cols-3 gap-4">
            <EditField label="Country">
              <select className={editInput} value={String(form.emergencyContactCountry || '')} onChange={(e) => set('emergencyContactCountry', e.target.value)}>
                <option value="">Select</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </EditField>
            <EditField label="City">
              <input className={editInput} value={String(form.emergencyContactCity || '')} onChange={(e) => set('emergencyContactCity', e.target.value)} />
            </EditField>
            <EditField label="Postal / ZIP">
              <input className={editInput} value={String(form.emergencyContactPostalCode || '')} onChange={(e) => set('emergencyContactPostalCode', e.target.value)} />
            </EditField>
          </div>
        </EditSection>

        <EditSection title="Travel & accommodation">
          <div className="grid md:grid-cols-3 gap-4">
            <EditField label="Arrival date">
              <input className={editInput} type="date" value={dateValue(form.arrivalDate)} onChange={(e) => set('arrivalDate', e.target.value)} />
            </EditField>
            <EditField label="Departure date">
              <input className={editInput} type="date" value={dateValue(form.departureDate)} onChange={(e) => set('departureDate', e.target.value)} />
            </EditField>
            <EditField label="Flight number">
              <input className={editInput} value={String(form.flightNumber || '')} onChange={(e) => set('flightNumber', e.target.value)} />
            </EditField>
          </div>
          {isInternational && (
            <div className="grid md:grid-cols-2 gap-4">
              <EditField label="Travel insurance provider">
                <input className={editInput} value={String(form.travelInsuranceProvider || '')} onChange={(e) => set('travelInsuranceProvider', e.target.value)} />
              </EditField>
              <EditField label="Travel insurance policy number">
                <input className={editInput} value={String(form.travelInsurancePolicyNumber || '')} onChange={(e) => set('travelInsurancePolicyNumber', e.target.value)} />
              </EditField>
              <EditField label="Travel insurance expiry">
                <input className={editInput} type="date" value={dateValue(form.travelInsuranceExpiry)} onChange={(e) => set('travelInsuranceExpiry', e.target.value)} />
              </EditField>
            </div>
          )}
          <label className={editCheckLabel}>
            <input type="checkbox" checked={Boolean(form.accommodationRequired)} onChange={(e) => set('accommodationRequired', e.target.checked)} className={editCheckbox} />
            Requires accommodation assistance
          </label>
          {Boolean(form.accommodationRequired) && (
            <EditField label="Accommodation preferences">
              <textarea className={editInput} rows={2} value={String(form.accommodationPreferences || '')} onChange={(e) => set('accommodationPreferences', e.target.value)} />
            </EditField>
          )}
        </EditSection>

        <EditSection title="Health & medical">
          <label className={`${editCheckLabel} mb-4`}>
            <input type="checkbox" checked={Boolean(form.hasHealthInsurance)} onChange={(e) => set('hasHealthInsurance', e.target.checked)} className={editCheckbox} />
            Has travel / health insurance
          </label>
          {Boolean(form.hasHealthInsurance) && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <EditField label="Insurance provider">
                <input className={editInput} value={String(form.insuranceProvider || '')} onChange={(e) => set('insuranceProvider', e.target.value)} />
              </EditField>
              <EditField label="Policy number">
                <input className={editInput} value={String(form.insurancePolicyNumber || '')} onChange={(e) => set('insurancePolicyNumber', e.target.value)} />
              </EditField>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <EditField label="Blood type">
              <select className={editInput} value={String(form.bloodType || '')} onChange={(e) => set('bloodType', e.target.value)}>
                <option value="">Not specified</option>
                {BLOOD_TYPE_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </EditField>
          </div>
          <EditField label="Medical conditions / allergies">
            <textarea className={editInput} rows={2} value={String(form.medicalConditions || '')} onChange={(e) => set('medicalConditions', e.target.value)} />
          </EditField>
        </EditSection>

        <EditSection title="Admin controls">
          <EditField label="Registration status">
            <StatusPills
              value={String(form.status || 'pending')}
              onChange={(v) => set('status', v)}
            />
          </EditField>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <EditField label="Payment status">
              <select className={editInput} value={String(form.paymentStatus || 'pending')} onChange={(e) => set('paymentStatus', e.target.value)}>
                <option value="pending">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </EditField>
            <EditField label="Security check">
              <select className={editInput} value={String(form.securityCheckStatus || 'pending')} onChange={(e) => set('securityCheckStatus', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="cleared">Cleared</option>
                <option value="flagged">Flagged</option>
              </select>
            </EditField>
            <EditField label="Safeguarding acknowledged">
              <input className={editInput} type="datetime-local" value={datetimeLocalValue(form.safeguardingAcknowledgedAt)} onChange={(e) => set('safeguardingAcknowledgedAt', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            </EditField>
          </div>
          <EditField label="Security check notes">
            <textarea className={editInput} rows={2} value={String(form.securityCheckNotes || '')} onChange={(e) => set('securityCheckNotes', e.target.value)} />
          </EditField>
          <EditField label="Admin notes">
            <textarea className={editInput} rows={4} value={String(form.notes || '')} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes (not visible to delegate)" />
          </EditField>
        </EditSection>

          <div className="sticky bottom-0 -mx-6 -mb-6 border-t border-slate-700/80 bg-[#0f1729] px-6 py-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/admin/registrations"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#121c2e] font-semibold py-3 px-4 hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 transition-all shadow-lg shadow-amber-900/25"
            >
              {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function dateValue(value: unknown): string {
  if (!value) return ''
  return String(value).substring(0, 10)
}

function datetimeLocalValue(value: unknown): string {
  if (!value) return ''
  const d = new Date(String(value))
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
