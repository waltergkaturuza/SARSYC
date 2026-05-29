'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  FiHeart, FiArrowLeft, FiLoader, FiCopy, FiCheck,
  FiUser, FiBriefcase, FiMail, FiPhone, FiMessageSquare,
  FiCreditCard, FiStar, FiAward, FiTrendingUp, FiZap, FiShield,
} from 'react-icons/fi'
import { showToast } from '@/lib/toast'
import { SARSYC_BANK_TRANSFER_DETAILS } from '@/lib/registrationBankTransfer'

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = 'donating' | 'sponsoring'
type DonorType = 'individual' | 'organisation'

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

const COLOR_MAP: Record<string, string> = {
  yellow: 'from-yellow-500 to-yellow-600',
  silver: 'from-gray-400 to-gray-500',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  red: 'from-red-500 to-red-600',
  gray: 'from-gray-600 to-gray-700',
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  star: FiStar,
  award: FiAward,
  trending: FiTrendingUp,
  heart: FiHeart,
  diamond: FiZap,
  trophy: FiShield,
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

export default function DonatePage() {
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
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Load sponsorship tiers ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/sponsorship-tiers?where[isActive][equals]=true&sort=order&limit=20')
      .then((r) => r.json())
      .then((data) => {
        const docs: SponsorshipTier[] = data?.docs ?? []
        setTiers(docs)
        if (docs.length > 0) setSelectedTier(docs[0])
      })
      .catch(() => {/* tiers optional */})
      .finally(() => setTiersLoading(false))
  }, [])

  // ── When mode switches to sponsoring, pick tier amount ────────────────────
  useEffect(() => {
    if (mode === 'sponsoring' && selectedTier?.priceAmountUsd) {
      setAmountUsd(String(selectedTier.priceAmountUsd))
    }
  }, [mode, selectedTier])

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
    if (mode === 'sponsoring' && !selectedTier)
      e.tier = 'Please select a sponsorship package'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [donorType, firstName, lastName, orgName, email, amountUsd, mode, selectedTier])

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
          sponsorshipTierName: selectedTier?.name,
          sponsorshipTierId: selectedTier?.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast.error(data.error || 'Payment could not be started. Please try again.')
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
    <div className="min-h-screen bg-gray-900 text-white">
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

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

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

              {/* ── Sponsoring: tier picker ─────────────────────────────── */}
              {mode === 'sponsoring' && (
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
                    Sponsorship Package
                  </label>
                  {tiersLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
                      <FiLoader className="animate-spin" size={14} /> Loading packages…
                    </div>
                  ) : tiers.length === 0 ? (
                    <p className="text-gray-400 text-sm py-2">
                      No sponsorship packages are available right now. Please contact us directly.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tiers.map((tier) => {
                        const gradient = COLOR_MAP[tier.color ?? 'gray'] ?? COLOR_MAP.gray
                        const Icon = ICON_MAP[tier.icon ?? 'star'] ?? FiStar
                        const isSelected = selectedTier?.id === tier.id
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => {
                              setSelectedTier(tier)
                              if (tier.priceAmountUsd) setAmountUsd(String(tier.priceAmountUsd))
                            }}
                            className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-primary-500 bg-primary-900/30'
                                : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
                            }`}
                          >
                            {tier.isPopular && (
                              <span className="absolute -top-2.5 left-3 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                POPULAR
                              </span>
                            )}
                            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${gradient} mb-2`}>
                              <Icon size={14} className="text-white" />
                            </div>
                            <p className="font-semibold text-sm">{tier.name}</p>
                            <p className="text-primary-400 font-bold text-sm">{tier.price}</p>
                            {tier.description && (
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{tier.description}</p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {errors.tier && <p className="text-red-400 text-xs mt-1">{errors.tier}</p>}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">
                  Amount (USD)
                  {mode === 'sponsoring' && selectedTier?.priceAmountUsd
                    ? ' — set by package'
                    : mode === 'donating'
                    ? ' — enter any amount (minimum 1)'
                    : ''}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    min={1}
                    step="any"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    readOnly={mode === 'sponsoring' && !!selectedTier?.priceAmountUsd}
                    placeholder={mode === 'donating' ? 'e.g. 50' : ''}
                    className={`w-full bg-gray-900 border border-gray-600 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary-500 ${
                      mode === 'sponsoring' && selectedTier?.priceAmountUsd
                        ? 'opacity-60 cursor-not-allowed'
                        : ''
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

          {/* Benefits preview for selected sponsorship tier */}
          {mode === 'sponsoring' && selectedTier && selectedTier.benefits && selectedTier.benefits.length > 0 && (
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
        </div>
      </div>
    </div>
  )
}
