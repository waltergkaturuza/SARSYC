'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  FiHeart, FiArrowLeft, FiLoader, FiCopy, FiCheck,
  FiUser, FiBriefcase, FiMail, FiPhone, FiMessageSquare,
  FiCreditCard,
} from 'react-icons/fi'
import { showToast } from '@/lib/toast'
import { SARSYC_BANK_TRANSFER_DETAILS } from '@/lib/registrationBankTransfer'
import { CONFERENCE_TRACKS } from '@/lib/conferenceTracks'
import { studentSponsorshipRateUsd, trackSponsorshipAmountUsd } from '@/lib/trackSponsorship'

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = 'donating' | 'sponsoring'
type DonorType = 'individual' | 'organisation'
type SponsorshipCategory = 'package' | 'track'
type TrackPayMode = 'students' | 'custom_amount'

interface SponsorshipTier {
  id: string | number
  name: string
  price: string
  priceAmountUsd?: number
  description?: string
  benefits?: { benefit: string }[]
  color?: string
  icon?: string
  isPopular?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseUsdFromPriceLabel(price: string): number | null {
  const digits = price.replace(/[^0-9.]/g, '')
  if (!digits) return null
  const n = parseFloat(digits)
  return Number.isFinite(n) && n > 0 ? n : null
}

function tierAmountUsd(tier: SponsorshipTier): number | null {
  if (typeof tier.priceAmountUsd === 'number' && tier.priceAmountUsd > 0) {
    return tier.priceAmountUsd
  }
  return parseUsdFromPriceLabel(tier.price)
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded text-gray-400 hover:text-primary-400 hover:bg-gray-700 transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DonatePageFallback() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <FiLoader className="animate-spin text-primary-400 w-8 h-8" aria-label="Loading" />
    </div>
  )
}

function DonatePageContent() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>('donating')
  const [donorType, setDonorType] = useState<DonorType>('individual')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [amountUsd, setAmountUsd] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTier, setSelectedTier] = useState<SponsorshipTier | null>(null)
  const [tiers, setTiers] = useState<SponsorshipTier[]>([])
  const [tiersLoading, setTiersLoading] = useState(true)
  const [sponsorshipCategory, setSponsorshipCategory] = useState<SponsorshipCategory>('package')
  const [selectedTrack, setSelectedTrack] = useState('')
  const [trackPayMode, setTrackPayMode] = useState<TrackPayMode>('students')
  const [studentCount, setStudentCount] = useState('1')
  const studentRateUsd = studentSponsorshipRateUsd()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Load sponsorship tiers (same source as /partnerships) ─────────────────
  useEffect(() => {
    const urlMode = searchParams.get('mode')
    const urlTier = searchParams.get('tier')
    const wantsSponsoring = urlMode === 'sponsoring' || !!urlTier

    fetch('/api/sponsorship-tiers')
      .then((r) => r.json())
      .then((data) => {
        const loaded: SponsorshipTier[] = data?.tiers ?? []
        setTiers(loaded)
        if (loaded.length === 0) return

        const matchedTier = urlTier
          ? loaded.find((t) => String(t.id) === urlTier) ?? null
          : null
        const tierToSelect = matchedTier ?? loaded[0]

        if (wantsSponsoring) {
          setMode('sponsoring')
          setSponsorshipCategory('package')
          setSelectedTier(tierToSelect)
          const amt = tierAmountUsd(tierToSelect)
          if (amt) setAmountUsd(String(amt))
          return
        }

        setSelectedTier(tierToSelect)
        const amt = tierAmountUsd(tierToSelect)
        if (amt) setAmountUsd(String(amt))
      })
      .catch(() => {/* tiers optional */})
      .finally(() => setTiersLoading(false))
  }, [searchParams])

  const handleTierSelect = (tierId: string) => {
    const tier = tiers.find((t) => String(t.id) === tierId) ?? null
    setSelectedTier(tier)
    if (tier) {
      const amt = tierAmountUsd(tier)
      if (amt) setAmountUsd(String(amt))
    }
  }

  const recalcTrackStudentAmount = useCallback((countRaw: string) => {
    const count = Math.max(1, Math.floor(Number(countRaw) || 0))
    const amt = trackSponsorshipAmountUsd({ mode: 'students', studentCount: count })
    if (amt > 0) setAmountUsd(String(amt))
  }, [])

  useEffect(() => {
    if (mode !== 'sponsoring' || sponsorshipCategory !== 'track') return
    if (trackPayMode === 'students') {
      recalcTrackStudentAmount(studentCount)
    }
  }, [mode, sponsorshipCategory, trackPayMode, studentCount, recalcTrackStudentAmount])

  useEffect(() => {
    if (mode === 'sponsoring' && sponsorshipCategory === 'package' && selectedTier) {
      const amt = tierAmountUsd(selectedTier)
      if (amt) setAmountUsd(String(amt))
    }
  }, [mode, sponsorshipCategory, selectedTier])

  const amountIsLocked =
    mode === 'sponsoring' &&
    ((sponsorshipCategory === 'package' && !!selectedTier && !!tierAmountUsd(selectedTier)) ||
      (sponsorshipCategory === 'track' && trackPayMode === 'students'))

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {}
    if (donorType === 'individual') {
      if (!firstName.trim()) e.firstName = 'First name is required'
      if (!lastName.trim()) e.lastName = 'Last name is required'
    } else {
      if (!orgName.trim()) e.orgName = 'Organisation name is required'
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'A valid email address is required'
    const amt = parseFloat(amountUsd)
    if (!amountUsd || isNaN(amt) || amt < 1)
      e.amountUsd = 'Minimum amount is USD 1'
    if (mode === 'sponsoring' && sponsorshipCategory === 'package' && !selectedTier)
      e.tier = 'Please select a sponsorship package'
    if (mode === 'sponsoring' && sponsorshipCategory === 'track') {
      if (!selectedTrack) e.track = 'Please select a conference track'
      if (trackPayMode === 'students') {
        const count = Math.floor(Number(studentCount))
        if (!Number.isFinite(count) || count < 1)
          e.studentCount = 'Enter at least one student to sponsor'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }, [
    donorType,
    firstName,
    lastName,
    orgName,
    email,
    amountUsd,
    mode,
    selectedTier,
    sponsorshipCategory,
    selectedTrack,
    trackPayMode,
    studentCount,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/payments/donate/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode === 'sponsoring' ? 'sponsorship' : 'donation',
          donorType,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          orgName: orgName || undefined,
          email,
          phone: phone || undefined,
          amountUsd: parseFloat(amountUsd),
          message: message || undefined,
          sponsorshipCategory: mode === 'sponsoring' ? sponsorshipCategory : undefined,
          sponsorshipTierName:
            mode === 'sponsoring' && sponsorshipCategory === 'package'
              ? selectedTier?.name
              : undefined,
          sponsorshipTierId:
            mode === 'sponsoring' && sponsorshipCategory === 'package'
              ? selectedTier?.id
              : undefined,
          conferenceTrack:
            mode === 'sponsoring' && sponsorshipCategory === 'track'
              ? selectedTrack
              : undefined,
          trackSponsorshipMode:
            mode === 'sponsoring' && sponsorshipCategory === 'track'
              ? trackPayMode
              : undefined,
          studentsSponsored:
            mode === 'sponsoring' &&
            sponsorshipCategory === 'track' &&
            trackPayMode === 'students'
              ? Math.floor(Number(studentCount))
              : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const detail =
          typeof data.error === 'string' ? data.error : 'Payment could not be started. Please try again.'
        const hint = typeof data.hint === 'string' ? data.hint : ''
        showToast.error(hint ? `${detail} ${hint}` : detail)
        return
      }
      window.location.href = data.redirectUrl
    } catch {
      showToast.error('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const b = SARSYC_BANK_TRANSFER_DETAILS

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 border-b border-primary-700">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-300 hover:text-white transition-colors mb-6 text-sm"
          >
            <FiArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
              <FiHeart size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Support SARSYC VI</h1>
          </div>
          <p className="text-primary-200 max-w-xl">
            Support the summit with a flexible donation or a fixed sponsorship package. Use the card form
            below, or pay by bank transfer on the right.
          </p>
        </div>
      </div>

      {/* Form + bank transfer — distinct band above site footer */}
      <section
        className="bg-gradient-to-b from-slate-900 via-[#0c1424] to-slate-950 border-b border-gray-800/90"
        aria-label="Donate or sponsor"
      >
      <div className="max-w-6xl mx-auto px-4 py-10 pb-14 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Card payment form ──────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700">
            {/* Mode toggle */}
            <div className="flex gap-1 bg-gray-900 rounded-xl p-1 mb-6 w-fit">
              {(['donating', 'sponsoring'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    mode === m
                      ? 'bg-primary-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m === 'donating' ? 'Donating' : 'Sponsoring'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Donor type */}
              <div className="flex gap-4 mb-2">
                {(['individual', 'organisation'] as DonorType[]).map((dt) => (
                  <label key={dt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="donorType"
                      value={dt}
                      checked={donorType === dt}
                      onChange={() => setDonorType(dt)}
                      className="accent-primary-500"
                    />
                    <span className="text-sm capitalize flex items-center gap-1.5">
                      {dt === 'individual' ? <FiUser size={14} /> : <FiBriefcase size={14} />}
                      {dt}
                    </span>
                  </label>
                ))}
              </div>

              {/* Name fields */}
              {donorType === 'individual' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                      First Name
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                    />
                    {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                      Last Name
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                    />
                    {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Organisation Name
                  </label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                  />
                  {errors.orgName && <p className="text-red-400 text-xs mt-1">{errors.orgName}</p>}
                </div>
              )}

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                    Phone <span className="normal-case text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+263 77 000 0000"
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* ── Sponsoring options ─────────────────────────────────────── */}
              {mode === 'sponsoring' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                      Sponsorship type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {([
                        ['package', 'Partnership package'],
                        ['track', 'Track sponsorship'],
                      ] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setSponsorshipCategory(value)
                            if (value === 'package' && selectedTier) {
                              const amt = tierAmountUsd(selectedTier)
                              if (amt) setAmountUsd(String(amt))
                            }
                            if (value === 'track' && trackPayMode === 'students') {
                              recalcTrackStudentAmount(studentCount)
                            }
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            sponsorshipCategory === value
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {sponsorshipCategory === 'package' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                          Select sponsorship package <span className="text-primary-400">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Packages match those on the{' '}
                          <Link href="/partnerships" className="text-primary-400 hover:underline">
                            Partnerships page
                          </Link>
                          .
                        </p>
                        {tiersLoading ? (
                          <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                            <FiLoader className="animate-spin" size={14} /> Loading packages…
                          </div>
                        ) : tiers.length === 0 ? (
                          <p className="text-gray-400 text-sm py-2">
                            No sponsorship packages are available right now.
                          </p>
                        ) : (
                          <select
                            value={selectedTier ? String(selectedTier.id) : ''}
                            onChange={(e) => handleTierSelect(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                          >
                            <option value="" disabled>
                              Choose a package…
                            </option>
                            {tiers.map((tier) => (
                              <option key={tier.id} value={String(tier.id)}>
                                {tier.name} — {tier.price}
                                {tier.isPopular ? ' (Popular)' : ''}
                              </option>
                            ))}
                          </select>
                        )}
                        {errors.tier && <p className="text-red-400 text-xs mt-1">{errors.tier}</p>}
                      </div>

                      {selectedTier && (
                        <div className="rounded-xl border border-gray-600 bg-gray-900/60 p-4">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Package category
                          </p>
                          <p className="font-semibold text-white">{selectedTier.name}</p>
                          {selectedTier.description && (
                            <p className="text-sm text-gray-400 mt-1">{selectedTier.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {sponsorshipCategory === 'track' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                          Select conference track <span className="text-primary-400">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          Choose the track you would like to spotlight with your sponsorship.
                        </p>
                        <select
                          value={selectedTrack}
                          onChange={(e) => setSelectedTrack(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                        >
                          <option value="">Choose a track…</option>
                          {CONFERENCE_TRACKS.map((track) => (
                            <option key={track.value} value={track.value}>
                              {track.label}
                            </option>
                          ))}
                        </select>
                        {errors.track && <p className="text-red-400 text-xs mt-1">{errors.track}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                          How would you like to sponsor?
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label className="flex items-start gap-2 cursor-pointer bg-gray-900/60 border border-gray-600 rounded-lg p-3 flex-1">
                            <input
                              type="radio"
                              name="trackPayMode"
                              checked={trackPayMode === 'students'}
                              onChange={() => {
                                setTrackPayMode('students')
                                recalcTrackStudentAmount(studentCount)
                              }}
                              className="accent-primary-500 mt-0.5"
                            />
                            <span>
                              <span className="block text-sm font-medium text-white">
                                Number of students
                              </span>
                              <span className="block text-xs text-gray-400 mt-0.5">
                                USD {studentRateUsd.toLocaleString()} per student/youth registration
                              </span>
                            </span>
                          </label>
                          <label className="flex items-start gap-2 cursor-pointer bg-gray-900/60 border border-gray-600 rounded-lg p-3 flex-1">
                            <input
                              type="radio"
                              name="trackPayMode"
                              checked={trackPayMode === 'custom_amount'}
                              onChange={() => setTrackPayMode('custom_amount')}
                              className="accent-primary-500 mt-0.5"
                            />
                            <span>
                              <span className="block text-sm font-medium text-white">
                                Custom amount
                              </span>
                              <span className="block text-xs text-gray-400 mt-0.5">
                                Enter any USD amount you wish to sponsor
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {trackPayMode === 'students' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                            Number of students to sponsor <span className="text-primary-400">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={studentCount}
                            onChange={(e) => {
                              setStudentCount(e.target.value)
                              recalcTrackStudentAmount(e.target.value)
                            }}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
                          />
                          {errors.studentCount && (
                            <p className="text-red-400 text-xs mt-1">{errors.studentCount}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {Math.max(1, Math.floor(Number(studentCount) || 0))} student(s) × USD{' '}
                            {studentRateUsd.toLocaleString()} ={' '}
                            <strong className="text-primary-300">
                              USD{' '}
                              {trackSponsorshipAmountUsd({
                                mode: 'students',
                                studentCount: Math.max(1, Math.floor(Number(studentCount) || 0)),
                              }).toLocaleString()}
                            </strong>
                          </p>
                        </div>
                      )}

                      {selectedTrack && (
                        <div className="rounded-xl border border-gray-600 bg-gray-900/60 p-4">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Track spotlight
                          </p>
                          <p className="font-semibold text-white">
                            {CONFERENCE_TRACKS.find((t) => t.value === selectedTrack)?.label}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            Your sponsorship supports youth participation in this conference track.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                  Amount (USD)
                  {amountIsLocked
                    ? ' — calculated automatically'
                    : mode === 'donating'
                    ? ' — enter any amount (minimum 1)'
                    : ' — enter amount to sponsor'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    readOnly={amountIsLocked}
                    placeholder={
                      mode === 'donating'
                        ? 'e.g. 50'
                        : mode === 'sponsoring' && sponsorshipCategory === 'track' && trackPayMode === 'custom_amount'
                        ? 'e.g. 1000'
                        : ''
                    }
                    className={`w-full bg-gray-900 border border-gray-600 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${
                      amountIsLocked ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                {errors.amountUsd && <p className="text-red-400 text-xs mt-1">{errors.amountUsd}</p>}
                {mode === 'donating' && (
                  <div className="flex gap-2 mt-2">
                    {[10, 25, 50, 100, 250].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmountUsd(String(v))}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          amountUsd === String(v)
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white'
                        }`}
                      >
                        ${v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                  Message <span className="normal-case text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <FiMessageSquare className="absolute left-3 top-3 text-gray-500" size={14} />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Leave a note or dedication…"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <><FiLoader className="animate-spin" size={18} /> Processing…</>
                ) : (
                  <><FiCreditCard size={18} />
                    {mode === 'sponsoring' ? 'Proceed to Payment' : 'Donate Now'}&nbsp;
                    {amountUsd && parseFloat(amountUsd) >= 1 ? `— $${parseFloat(amountUsd).toLocaleString()}` : ''}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                Secure card payment via Stanbic Bank Zimbabwe / N-Genius
              </p>
            </form>
          </div>
        </div>

        {/* ── Right: Bank transfer ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400 text-sm">🏦</span>
              </div>
              <h2 className="font-semibold text-lg">Bank Transfer</h2>
            </div>

            <div className="space-y-3 text-sm">
              {[
                ['Bank', b.bankName],
                ['Account Name', b.accountName],
                ['Account Number', b.accountNumber],
                ['Branch', b.branchName],
                ['SWIFT', b.swiftCode],
                ['Currency', b.currency],
                ['Intermediary', `${b.intermediaryBankName} (${b.intermediarySwiftCode})`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-medium text-gray-100">{value}</p>
                  </div>
                  <CopyButton value={value} label={label} />
                </div>
              ))}
            </div>

            <div className="mt-4 bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-3 text-xs text-yellow-300">
              <strong>Payment reference:</strong> Include your name or organisation when making the
              transfer so we can acknowledge your{' '}
              {mode === 'sponsoring' ? 'sponsorship' : 'donation'}. For international transfers, use
              the SWIFT code above.
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Questions?{' '}
              <a
                href="mailto:researchunit@saywhat.org.zw"
                className="text-primary-400 hover:underline"
              >
                researchunit@saywhat.org.zw
              </a>
            </p>
          </div>

          {/* Benefits preview */}
          {mode === 'sponsoring' &&
            sponsorshipCategory === 'package' &&
            selectedTier &&
            selectedTier.benefits &&
            selectedTier.benefits.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <p className="font-semibold text-sm mb-3">
                {selectedTier.name} — included benefits
              </p>
              <ul className="space-y-2">
                {selectedTier.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <FiCheck size={14} className="text-primary-400 mt-0.5 shrink-0" />
                    {b.benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mode === 'sponsoring' && sponsorshipCategory === 'track' && selectedTrack && (
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <p className="font-semibold text-sm mb-2">Track sponsorship summary</p>
              <p className="text-sm text-gray-300">
                {CONFERENCE_TRACKS.find((t) => t.value === selectedTrack)?.label}
              </p>
              {trackPayMode === 'students' && (
                <p className="text-xs text-gray-400 mt-2">
                  Sponsoring {Math.max(1, Math.floor(Number(studentCount) || 0))} student(s) at USD{' '}
                  {studentRateUsd.toLocaleString()} each.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      </section>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense fallback={<DonatePageFallback />}>
      <DonatePageContent />
    </Suspense>
  )
}
