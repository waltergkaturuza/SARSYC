'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSave, FiLoader } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { showToast } from '@/lib/toast'

const CATEGORIES = [
  { value: 'student', label: 'Student / Youth Delegate' },
  { value: 'researcher', label: 'Young Researcher' },
  { value: 'policymaker', label: 'Policymaker / Government Official' },
  { value: 'partner', label: 'Development Partner' },
  { value: 'observer', label: 'Observer' },
]

const TSHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const DIETARY_OPTIONS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Lactose-free',
  'Other',
]

export default function EditRegistrationPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/admin/registrations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm(data.doc || data)
        setLoading(false)
      })
      .catch(() => {
        showToast.error('Failed to load registration')
        setLoading(false)
      })
  }, [id])

  const set = (field: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          country: form.country,
          nationality: form.nationality,
          city: form.city,
          address: form.address,
          organization: form.organization,
          organizationPosition: form.organizationPosition,
          category: form.category,
          status: form.status,
          paymentStatus: form.paymentStatus,
          securityCheckStatus: form.securityCheckStatus,
          securityCheckNotes: form.securityCheckNotes,
          visaStatus: form.visaStatus,
          visaRequired: form.visaRequired,
          tshirtSize: form.tshirtSize,
          dietaryRestrictions: form.dietaryRestrictions,
          accessibilityNeeds: form.accessibilityNeeds,
          notes: form.notes,
          arrivalDate: form.arrivalDate,
          departureDate: form.departureDate,
          flightNumber: form.flightNumber,
        }),
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
    return (
      <div className="p-8 text-center text-gray-600">Registration not found.</div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
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
          {form.registrationId} — {form.firstName} {form.lastName}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Personal Information ─────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="First Name *">
              <input className={input} value={form.firstName || ''} onChange={(e) => set('firstName', e.target.value)} required />
            </Field>
            <Field label="Last Name *">
              <input className={input} value={form.lastName || ''} onChange={(e) => set('lastName', e.target.value)} required />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Email *">
              <input className={input} type="email" value={form.email || ''} onChange={(e) => set('email', e.target.value)} required />
            </Field>
            <Field label="Phone *">
              <input className={input} value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Date of Birth">
              <input
                className={input}
                type="date"
                value={form.dateOfBirth ? form.dateOfBirth.substring(0, 10) : ''}
                onChange={(e) => set('dateOfBirth', e.target.value)}
              />
            </Field>
            <Field label="Gender">
              <select className={input} value={form.gender || ''} onChange={(e) => set('gender', e.target.value)}>
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
              <select className={input} value={form.country || ''} onChange={(e) => set('country', e.target.value)}>
                <option value="">Select country</option>
                {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Nationality">
              <select className={input} value={form.nationality || ''} onChange={(e) => set('nationality', e.target.value)}>
                <option value="">Select nationality</option>
                {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="City">
              <input className={input} value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="Address">
              <textarea className={input} rows={2} value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Organization / Institution">
              <input className={input} value={form.organization || ''} onChange={(e) => set('organization', e.target.value)} />
            </Field>
            <Field label="Position / Title">
              <input className={input} value={form.organizationPosition || ''} onChange={(e) => set('organizationPosition', e.target.value)} />
            </Field>
          </div>
        </section>

        {/* ── Registration Details ──────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Registration Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Participation Category">
              <select className={input} value={form.category || ''} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="T-Shirt Size">
              <select className={input} value={form.tshirtSize || ''} onChange={(e) => set('tshirtSize', e.target.value)}>
                <option value="">Select size</option>
                {TSHIRT_SIZES.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Dietary Restrictions">
            <select className={input} value={form.dietaryRestrictions || ''} onChange={(e) => set('dietaryRestrictions', e.target.value)}>
              <option value="">None / Not specified</option>
              {DIETARY_OPTIONS.map((d) => <option key={d} value={d.toLowerCase()}>{d}</option>)}
            </select>
          </Field>

          <Field label="Accessibility Requirements">
            <textarea className={input} rows={2} value={form.accessibilityNeeds || ''} onChange={(e) => set('accessibilityNeeds', e.target.value)} placeholder="Any accessibility needs..." />
          </Field>
        </section>

        {/* ── Travel ───────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Travel Information
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Arrival Date">
              <input className={input} type="date" value={form.arrivalDate ? form.arrivalDate.substring(0, 10) : ''} onChange={(e) => set('arrivalDate', e.target.value)} />
            </Field>
            <Field label="Departure Date">
              <input className={input} type="date" value={form.departureDate ? form.departureDate.substring(0, 10) : ''} onChange={(e) => set('departureDate', e.target.value)} />
            </Field>
            <Field label="Flight Number">
              <input className={input} value={form.flightNumber || ''} onChange={(e) => set('flightNumber', e.target.value)} placeholder="e.g. QR412" />
            </Field>
          </div>

          {form.isInternational && (
            <Field label="Visa Status">
              <select className={input} value={form.visaStatus || ''} onChange={(e) => set('visaStatus', e.target.value)}>
                <option value="">Select</option>
                <option value="not-applied">Not Applied</option>
                <option value="applied-pending">Applied – Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </Field>
          )}
        </section>

        {/* ── Admin Controls ────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Admin Controls
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Registration Status">
              <select className={input} value={form.status || 'pending'} onChange={(e) => set('status', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
            <Field label="Payment Status">
              <select className={input} value={form.paymentStatus || 'pending'} onChange={(e) => set('paymentStatus', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
                <option value="failed">Failed</option>
              </select>
            </Field>
            <Field label="Security Check">
              <select className={input} value={form.securityCheckStatus || 'pending'} onChange={(e) => set('securityCheckStatus', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="cleared">Cleared</option>
                <option value="flagged">Flagged</option>
              </select>
            </Field>
          </div>

          <Field label="Security Check Notes">
            <textarea className={input} rows={2} value={form.securityCheckNotes || ''} onChange={(e) => set('securityCheckNotes', e.target.value)} placeholder="Internal security notes..." />
          </Field>

          <Field label="Admin Notes">
            <textarea className={input} rows={3} value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes visible only to admins..." />
          </Field>
        </section>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-8">
          <Link href={`/admin/registrations/${id}`} className="btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const input =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}
