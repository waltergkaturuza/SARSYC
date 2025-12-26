'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiSave, FiLoader, FiPlus, FiX } from 'react-icons/fi'

interface SessionData {
  title: string
  description: string
  type: string
  track: string
  date: string
  startTime: string
  endTime: string
  venue: string
  capacity?: number
  speakers: string[]
  moderator?: string
  presentations: string[]
  requiresRegistration: boolean
  materials: Array<{ material?: string; description?: string }>
}

interface SessionFormProps {
  initialData?: any
  mode: 'create' | 'edit'
  speakers?: any[]
  abstracts?: any[]
}

export default function SessionForm({ initialData, mode, speakers = [], abstracts = [] }: SessionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Format dates for input fields
  const formatDateForInput = (date: string | Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const formatTimeForInput = (date: string | Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toTimeString().slice(0, 5)
  }

  const [formData, setFormData] = useState<SessionData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || '',
    track: initialData?.track || '',
    date: formatDateForInput(initialData?.date),
    startTime: formatTimeForInput(initialData?.startTime),
    endTime: formatTimeForInput(initialData?.endTime),
    venue: initialData?.venue || '',
    capacity: initialData?.capacity || undefined,
    speakers: initialData?.speakers?.map((s: any) => typeof s === 'string' ? s : s.id) || [],
    moderator: initialData?.moderator?.id || initialData?.moderator || '',
    presentations: initialData?.presentations?.map((p: any) => typeof p === 'string' ? p : p.id) || [],
    requiresRegistration: initialData?.requiresRegistration || false,
    materials: initialData?.materials || [],
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { material: '', description: '' }]
    }))
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }))
  }

  const updateMaterial = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.type) newErrors.type = 'Session type is required'
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (formData.startTime >= formData.endTime) newErrors.endTime = 'End time must be after start time'
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      // Combine date and time for Payload
      const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`)

      const submitData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        track: formData.track || undefined,
        date: formData.date,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        venue: formData.venue,
        capacity: formData.capacity || undefined,
        speakers: formData.speakers.filter(Boolean),
        moderator: formData.moderator || undefined,
        presentations: formData.presentations.filter(Boolean),
        requiresRegistration: formData.requiresRegistration,
        materials: formData.materials.filter(m => m.material || m.description),
      }

      const url = mode === 'create' 
        ? '/api/admin/sessions'
        : `/api/admin/sessions/${initialData.id}`
      
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
              placeholder="Enter session title"
            />
          </FormField>

          <FormField label="Description" required error={errors.description}>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter session description..."
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
                <option value="keynote">Keynote</option>
                <option value="plenary">Plenary</option>
                <option value="panel">Panel Discussion</option>
                <option value="workshop">Workshop</option>
                <option value="oral">Oral Presentations</option>
                <option value="poster">Poster Session</option>
                <option value="networking">Networking</option>
                <option value="side-event">Side Event</option>
              </select>
            </FormField>

            <FormField label="Conference Track">
              <select
                value={formData.track}
                onChange={(e) => handleInputChange('track', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select track (optional)</option>
                <option value="srhr">Track 1: Youth Sexual & Reproductive Health</option>
                <option value="education">Track 2: Education & Skills Development</option>
                <option value="advocacy">Track 3: Advocacy & Policy Influence</option>
                <option value="innovation">Track 4: Innovation & Technology for Youth</option>
                <option value="general">General/Plenary</option>
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <FormField label="Date" required error={errors.date}>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>

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
              onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., 100"
            />
          </FormField>
        </div>
      </div>

      {/* Speakers */}
      {speakers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Speakers & Moderators</h2>
          
          <div className="space-y-6">
            <FormField label="Speakers" hint="Select speakers for this session">
              <select
                multiple
                value={formData.speakers}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  handleInputChange('speakers', selected)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px]"
                size={5}
              >
                {speakers.map((speaker) => (
                  <option key={speaker.id} value={speaker.id}>
                    {speaker.name} - {speaker.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </FormField>

            <FormField label="Session Moderator" hint="Optional">
              <select
                value={formData.moderator || ''}
                onChange={(e) => handleInputChange('moderator', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select moderator (optional)</option>
                {speakers.map((speaker) => (
                  <option key={speaker.id} value={speaker.id}>
                    {speaker.name} - {speaker.title}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      )}

      {/* Linked Presentations (for oral/poster sessions) */}
      {(formData.type === 'oral' || formData.type === 'poster') && abstracts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <FormField label="Linked Presentations" hint="Select accepted abstracts for this session">
            <select
              multiple
              value={formData.presentations}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                handleInputChange('presentations', selected)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[120px]"
              size={5}
            >
              {abstracts.filter(a => a.status === 'accepted').map((abstract) => (
                <option key={abstract.id} value={abstract.id}>
                  {abstract.title} - {abstract.primaryAuthor?.firstName} {abstract.primaryAuthor?.lastName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
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

