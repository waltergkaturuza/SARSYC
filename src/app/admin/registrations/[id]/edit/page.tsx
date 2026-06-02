'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiLoader } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { showToast } from '@/lib/toast'
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
        router.push(`/admin/registrations/${id}`)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!form) {
    return <div className="p-8 text-center text-gray-600">Registration not found.</div>
  }

  const isInternational = Boolean(form.isInternational)
  const dietary = Array.isArray(form.dietaryRestrictions)
    ? (form.dietaryRestrictions as string[])
    : []

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <Link
          href={`/admin/registrations/${id}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back to Registration
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Registration</h1>
        <p className="text-gray-500 mt-1">
          {String(form.registrationId || '')} — {String(form.firstName || '')}{' '}
          {String(form.lastName || '')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Section title="Personal Information">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="First Name *">
              <input className={input} value={String(form.firstName || '')} onChange={(e) => set('firstName', e.target.value)} required />
            </Field>
            <Field label="Last Name *">
              <input className={input} value={String(form.lastName || '')} onChange={(e) => set('lastName', e.target.value)} required />
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Email *">
              <input className={input} type="email" value={String(form.email || '')} onChange={(e) => set('email', e.target.value)} required />
            </Field>
            <Field label="Phone">
              <input className={input} value={String(form.phone || '')} onChange={(e) => set('phone', e.target.value)} />
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Date of Birth">
              <input className={input} type="date" value={dateValue(form.dateOfBirth)} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </Field>
            <Field label="Gender">
              <select className={input} value={String(form.gender || '')} onChange={(e) => set('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Country of Residence">
              <select className={input} value={String(form.country || '')} onChange={(e) => set('country', e.target.value)}>
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Nationality">
              <select className={input} value={String(form.nationality || '')} onChange={(e) => set('nationality', e.target.value)}>
                <option value="">Select nationality</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="City">
              <input className={input} value={String(form.city || '')} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="Address">
              <textarea className={input} rows={2} value={String(form.address || '')} onChange={(e) => set('address', e.target.value)} />
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Organization / Institution">
              <input className={input} value={String(form.organization || '')} onChange={(e) => set('organization', e.target.value)} />
            </Field>
            <Field label="Position / Title">
              <input className={input} value={String(form.organizationPosition || '')} onChange={(e) => set('organizationPosition', e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Conference Registration">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Conference package *">
              <select
                className={input}
                value={String(form.registrationPackage || '')}
                onChange={(e) => set('registrationPackage', e.target.value)}
                required
              >
                <option value="">Select package</option>
                {REGISTRATION_PACKAGE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Participation category *">
              <select className={input} value={String(form.category || '')} onChange={(e) => set('category', e.target.value)} required>
                <option value="">Select category</option>
                {PARTICIPATION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="T-Shirt Size">
              <select className={input} value={String(form.tshirtSize || '')} onChange={(e) => set('tshirtSize', e.target.value)}>
                <option value="">Select size</option>
                {TSHIRT_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Dietary restrictions">
            <div className="flex flex-wrap gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option.value} className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={dietary.includes(option.value)}
                    onChange={() => toggleDietary(option.value)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </Field>

          <Field label="Accessibility requirements">
            <textarea className={input} rows={2} value={String(form.accessibilityNeeds || '')} onChange={(e) => set('accessibilityNeeds', e.target.value)} />
          </Field>
        </Section>

        <Section title="International / ID">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-4">
            <input
              type="checkbox"
              checked={isInternational}
              onChange={(e) => set('isInternational', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            International attendee
          </label>

          {isInternational ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Passport number">
                  <input className={input} value={String(form.passportNumber || '')} onChange={(e) => set('passportNumber', e.target.value)} />
                </Field>
                <Field label="Passport expiry">
                  <input className={input} type="date" value={dateValue(form.passportExpiry)} onChange={(e) => set('passportExpiry', e.target.value)} />
                </Field>
              </div>
              <Field label="Passport issuing country">
                <select className={input} value={String(form.passportIssuingCountry || '')} onChange={(e) => set('passportIssuingCountry', e.target.value)}>
                  <option value="">Select country</option>
                  {countries.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </Field>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={Boolean(form.visaRequired)} onChange={(e) => set('visaRequired', e.target.checked)} className="rounded border-gray-300 text-primary-600" />
                Visa required
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Visa status">
                  <select className={input} value={String(form.visaStatus || '')} onChange={(e) => set('visaStatus', e.target.value)}>
                    <option value="">Select</option>
                    {VISA_STATUS_OPTIONS.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Visa application date">
                  <input className={input} type="date" value={dateValue(form.visaApplicationDate)} onChange={(e) => set('visaApplicationDate', e.target.value)} />
                </Field>
                <Field label="Visa number">
                  <input className={input} value={String(form.visaNumber || '')} onChange={(e) => set('visaNumber', e.target.value)} />
                </Field>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.visaInvitationLetterRequired !== false}
                  onChange={(e) => set('visaInvitationLetterRequired', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600"
                />
                Requires visa invitation letter
              </label>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="National ID number">
                <input className={input} value={String(form.nationalIdNumber || '')} onChange={(e) => set('nationalIdNumber', e.target.value)} />
              </Field>
              <Field label="ID type">
                <select className={input} value={String(form.nationalIdType || '')} onChange={(e) => set('nationalIdType', e.target.value)}>
                  <option value="">Select</option>
                  {NATIONAL_ID_TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </Section>

        <Section title="Emergency contact (next of kin)">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Full name">
              <input className={input} value={String(form.emergencyContactName || '')} onChange={(e) => set('emergencyContactName', e.target.value)} />
            </Field>
            <Field label="Relationship">
              <select className={input} value={String(form.emergencyContactRelationship || '')} onChange={(e) => set('emergencyContactRelationship', e.target.value)}>
                <option value="">Select</option>
                {EMERGENCY_RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone">
              <input className={input} value={String(form.emergencyContactPhone || '')} onChange={(e) => set('emergencyContactPhone', e.target.value)} />
            </Field>
            <Field label="Email">
              <input className={input} type="email" value={String(form.emergencyContactEmail || '')} onChange={(e) => set('emergencyContactEmail', e.target.value)} />
            </Field>
          </div>
          <Field label="Home address">
            <textarea className={input} rows={2} value={String(form.emergencyContactAddress || '')} onChange={(e) => set('emergencyContactAddress', e.target.value)} />
          </Field>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Country">
              <select className={input} value={String(form.emergencyContactCountry || '')} onChange={(e) => set('emergencyContactCountry', e.target.value)}>
                <option value="">Select</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="City">
              <input className={input} value={String(form.emergencyContactCity || '')} onChange={(e) => set('emergencyContactCity', e.target.value)} />
            </Field>
            <Field label="Postal / ZIP">
              <input className={input} value={String(form.emergencyContactPostalCode || '')} onChange={(e) => set('emergencyContactPostalCode', e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section title="Travel & accommodation">
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Arrival date">
              <input className={input} type="date" value={dateValue(form.arrivalDate)} onChange={(e) => set('arrivalDate', e.target.value)} />
            </Field>
            <Field label="Departure date">
              <input className={input} type="date" value={dateValue(form.departureDate)} onChange={(e) => set('departureDate', e.target.value)} />
            </Field>
            <Field label="Flight number">
              <input className={input} value={String(form.flightNumber || '')} onChange={(e) => set('flightNumber', e.target.value)} />
            </Field>
          </div>
          {isInternational && (
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Travel insurance provider">
                <input className={input} value={String(form.travelInsuranceProvider || '')} onChange={(e) => set('travelInsuranceProvider', e.target.value)} />
              </Field>
              <Field label="Travel insurance policy number">
                <input className={input} value={String(form.travelInsurancePolicyNumber || '')} onChange={(e) => set('travelInsurancePolicyNumber', e.target.value)} />
              </Field>
              <Field label="Travel insurance expiry">
                <input className={input} type="date" value={dateValue(form.travelInsuranceExpiry)} onChange={(e) => set('travelInsuranceExpiry', e.target.value)} />
              </Field>
            </div>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={Boolean(form.accommodationRequired)} onChange={(e) => set('accommodationRequired', e.target.checked)} className="rounded border-gray-300 text-primary-600" />
            Requires accommodation assistance
          </label>
          {Boolean(form.accommodationRequired) && (
            <Field label="Accommodation preferences">
              <textarea className={input} rows={2} value={String(form.accommodationPreferences || '')} onChange={(e) => set('accommodationPreferences', e.target.value)} />
            </Field>
          )}
        </Section>

        <Section title="Health & medical">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-4">
            <input type="checkbox" checked={Boolean(form.hasHealthInsurance)} onChange={(e) => set('hasHealthInsurance', e.target.checked)} className="rounded border-gray-300 text-primary-600" />
            Has travel / health insurance
          </label>
          {Boolean(form.hasHealthInsurance) && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Field label="Insurance provider">
                <input className={input} value={String(form.insuranceProvider || '')} onChange={(e) => set('insuranceProvider', e.target.value)} />
              </Field>
              <Field label="Policy number">
                <input className={input} value={String(form.insurancePolicyNumber || '')} onChange={(e) => set('insurancePolicyNumber', e.target.value)} />
              </Field>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Blood type">
              <select className={input} value={String(form.bloodType || '')} onChange={(e) => set('bloodType', e.target.value)}>
                <option value="">Not specified</option>
                {BLOOD_TYPE_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Medical conditions / allergies">
            <textarea className={input} rows={2} value={String(form.medicalConditions || '')} onChange={(e) => set('medicalConditions', e.target.value)} />
          </Field>
        </Section>

        <Section title="Admin controls">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Registration status">
              <select className={input} value={String(form.status || 'pending')} onChange={(e) => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
            <Field label="Payment status">
              <select className={input} value={String(form.paymentStatus || 'pending')} onChange={(e) => set('paymentStatus', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </Field>
            <Field label="Security check">
              <select className={input} value={String(form.securityCheckStatus || 'pending')} onChange={(e) => set('securityCheckStatus', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="cleared">Cleared</option>
                <option value="flagged">Flagged</option>
              </select>
            </Field>
            <Field label="Safeguarding acknowledged">
              <input className={input} type="datetime-local" value={datetimeLocalValue(form.safeguardingAcknowledgedAt)} onChange={(e) => set('safeguardingAcknowledgedAt', e.target.value ? new Date(e.target.value).toISOString() : '')} />
            </Field>
          </div>
          <Field label="Security check notes">
            <textarea className={input} rows={2} value={String(form.securityCheckNotes || '')} onChange={(e) => set('securityCheckNotes', e.target.value)} />
          </Field>
          <Field label="Admin notes">
            <textarea className={input} rows={3} value={String(form.notes || '')} onChange={(e) => set('notes', e.target.value)} />
          </Field>
        </Section>

        <div className="flex items-center justify-between pt-2 pb-8">
          <Link href={`/admin/registrations/${id}`} className="btn-outline">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

const input =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white'

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
