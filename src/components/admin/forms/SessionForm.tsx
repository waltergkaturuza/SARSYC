'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FormField from './FormField'
import { FiSave, FiLoader } from 'react-icons/fi'
import { slateToPlainText } from '@/lib/newsContent'
import {
  SESSION_TYPE_OPTIONS,
  SESSION_TRACK_OPTIONS,
  SESSION_DAY_OPTIONS,
} from '@/lib/sessionsContent'

interface SessionData {
  title: string
  description: string
  type: string
  day: string
  track: string
  date: string
  startTime: string
  endTime: string
  venue: string
  capacity?: number
  speakers: string[]
  committeeMembers: string[]
  speakerNames: string
  moderator?: string
  presentations: string[]
  requiresRegistration: boolean
}

interface SessionFormProps {
  initialData?: any
  mode: 'create' | 'edit'
  speakers?: any[]
  committeeMembers?: any[]
  abstracts?: any[]
}

// Times are stored as UTC-encoded wall-clock values so they display exactly
// as typed, regardless of the server or visitor time zone.
const formatDateForInput = (date: string | Date | undefined) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

const formatTimeForInput = (date: string | Date | undefined) => {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

const relationId = (value: any): string => {
  if (value == null) return ''
  if (typeof value === 'object') return String(value.id ?? '')
  return String(value)
}

export default function SessionForm({
  initialData,
  mode,
  speakers = [],
  committeeMembers = [],
  abstracts = [],
}: SessionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<SessionData>({
    title: initialData?.title || '',
    description: slateToPlainText(initialData?.description),
    type: initialData?.type || '',
    day: initialData?.day || 'day-1',
    track: initialData?.track || '',
    date: formatDateForInput(initialData?.date),
    startTime: formatTimeForInput(initialData?.startTime),
    endTime: formatTimeForInput(initialData?.endTime),
    venue: initialData?.venue || '',
    capacity: initialData?.capacity || undefined,
    speakers: (initialData?.speakers || []).map(relationId).filter(Boolean),
    committeeMembers: (initialData?.committeeMembers || []).map(relationId).filter(Boolean),
    speakerNames: initialData?.speakerNames || '',
    moderator: relationId(initialData?.moderator),
    presentations: (initialData?.presentations || []).map(relationId).filter(Boolean),
    requiresRegistration: initialData?.requiresRegistration || false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleDayChange = (day: string) => {
    setFormData((prev) => {
      const dayOption = SESSION_DAY_OPTIONS.find((option) => option.value === day)
      return {
        ...prev,
        day,
        // Auto-fill the date from the selected conference day when empty or
        // when it currently matches another conference day.
        date:
          dayOption?.date &&
          (!prev.date || SESSION_DAY_OPTIONS.some((option) => option.date === prev.date))
            ? dayOption.date
            : prev.date,
      }
    })
    if (errors.day) setErrors((prev) => ({ ...prev, day: '' }))
  }

  const toggleSpeaker = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      speakers: prev.speakers.includes(id)
        ? prev.speakers.filter((existing) => existing !== id)
        : [...prev.speakers, id],
    }))
  }

  const toggleCommitteeMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      committeeMembers: prev.committeeMembers.includes(id)
        ? prev.committeeMembers.filter((existing) => existing !== id)
        : [...prev.committeeMembers, id],
    }))
  }

  const togglePresentation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      presentations: prev.presentations.includes(id)
        ? prev.presentations.filter((existing) => existing !== id)
        : [...prev.presentations, id],
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.type) newErrors.type = 'Session type is required'
    if (!formData.day) newErrors.day = 'Conference day is required'
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        day: formData.day,
        track: formData.track || null,
        date: formData.date,
        startTime: `${formData.date}T${formData.startTime}:00.000Z`,
        endTime: `${formData.date}T${formData.endTime}:00.000Z`,
        venue: formData.venue,
        capacity: formData.capacity || null,
        speakers: formData.speakers,
        committeeMembers: formData.committeeMembers,
        speakerNames: formData.speakerNames.trim(),
        moderator: formData.moderator || null,
        presentations: formData.presentations,
        requiresRegistration: formData.requiresRegistration,
      }

      const url =
        mode === 'create' ? '/api/admin/sessions' : `/api/admin/sessions/${initialData.id}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save session')
      }

      router.push('/admin/sessions')
      router.refresh()
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const acceptedAbstracts = abstracts.filter((a) => a.status === 'accepted')

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Information</h2>

        <div className="space-y-6">
          <FormField label="Session Title" required error={errors.title}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. Opening Remarks, Abstracts Presentation"
            />
          </FormField>

          <FormField label="Description" required error={errors.description}>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="What happens during this session..."
            />
          </FormField>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Session Type" required error={errors.type}>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                {SESSION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Conference Track" hint="Leave empty for general sessions">
              <select
                value={formData.track}
                onChange={(e) => handleInputChange('track', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">No specific track</option>
                {SESSION_TRACK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <FormField label="Conference Day" required error={errors.day}>
            <select
              value={formData.day}
              onChange={(e) => handleDayChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {SESSION_DAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Date" required error={errors.date}>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Start Time" required error={errors.startTime}>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="End Time" required error={errors.endTime}>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>
        </div>
      </div>

      {/* Venue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Venue Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Venue/Room" required error={errors.venue}>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => handleInputChange('venue', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Main Hall A"
            />
          </FormField>

          <FormField label="Room Capacity" hint="Optional">
            <input
              type="number"
              value={formData.capacity || ''}
              onChange={(e) =>
                handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., 100"
            />
          </FormField>
        </div>
      </div>

      {/* Speakers */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Speakers & Moderators</h2>

        <div className="space-y-6">
          <FormField
            label="Speakers"
            hint="Tick the speakers already uploaded to the system who take part in this session"
          >
            {speakers.length === 0 ? (
              <p className="text-sm text-gray-500">
                No speakers in the system yet.{' '}
                <Link href="/admin/speakers/new" className="text-primary-600 hover:underline">
                  Add a speaker first
                </Link>{' '}
                or type guest names below.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {speakers.map((speaker) => (
                  <label
                    key={speaker.id}
                    className="flex items-start gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.speakers.includes(String(speaker.id))}
                      onChange={() => toggleSpeaker(String(speaker.id))}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900">{speaker.name}</span>
                      {(speaker.title || speaker.organization) && (
                        <span className="block text-gray-500">
                          {[speaker.title, speaker.organization].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </FormField>

          <FormField
            label="Youth Steering Committee Members"
            hint="Tick committee members taking part in this session (e.g. chairing or giving remarks)"
          >
            {committeeMembers.length === 0 ? (
              <p className="text-sm text-gray-500">
                No committee members in the system yet.{' '}
                <Link
                  href="/admin/youth-steering-committee/new"
                  className="text-primary-600 hover:underline"
                >
                  Add a committee member first
                </Link>
                .
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {committeeMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-start gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.committeeMembers.includes(String(member.id))}
                      onChange={() => toggleCommitteeMember(String(member.id))}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      {(member.role || member.country) && (
                        <span className="block text-gray-500">
                          {[member.role, member.country].filter(Boolean).join(' — ')}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </FormField>

          <FormField
            label="Additional Speaker Names"
            hint="Guest presenters not in the speakers list, separated by commas"
          >
            <input
              type="text"
              value={formData.speakerNames}
              onChange={(e) => handleInputChange('speakerNames', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. Harry Chiwoza (Malawi), Dr. Kahimbi Sylvia Mahoto (Namibia)"
            />
          </FormField>

          <FormField label="Session Moderator" hint="Optional">
            <select
              value={formData.moderator || ''}
              onChange={(e) => handleInputChange('moderator', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select moderator (optional)</option>
              {speakers.map((speaker) => (
                <option key={speaker.id} value={String(speaker.id)}>
                  {speaker.name}
                  {speaker.organization ? ` — ${speaker.organization}` : ''}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Linked Presentations (for oral/poster sessions) */}
      {(formData.type === 'oral' || formData.type === 'poster') && acceptedAbstracts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Linked Presentations</h2>
          <FormField label="Accepted Abstracts" hint="Tick the abstracts presented in this session">
            <div className="grid gap-3 max-h-72 overflow-y-auto pr-1">
              {acceptedAbstracts.map((abstract) => (
                <label
                  key={abstract.id}
                  className="flex items-start gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.presentations.includes(String(abstract.id))}
                    onChange={() => togglePresentation(String(abstract.id))}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-gray-900">{abstract.title}</span>
                    {abstract.primaryAuthor && (
                      <span className="block text-gray-500">
                        {abstract.primaryAuthor?.firstName} {abstract.primaryAuthor?.lastName}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </FormField>
        </div>
      )}

      {/* Registration Requirement */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.requiresRegistration}
            onChange={(e) => handleInputChange('requiresRegistration', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <div className="font-medium text-gray-900">Requires Separate Registration</div>
            <div className="text-sm text-gray-500">Check this for workshops with limited capacity</div>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              {mode === 'create' ? 'Create Session' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
