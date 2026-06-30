'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiUpload, FiX, FiPlus, FiSave, FiLoader } from 'react-icons/fi'
import Image from 'next/image'
import { countries } from '@/lib/countries'
import SpeakerDeleteButton from '@/components/admin/SpeakerDeleteButton'

function getSpeakerPhotoBlobUrl(photo: unknown): string {
  if (!photo || typeof photo !== 'object') return ''
  const record = photo as { url?: string; thumbnailURL?: string }
  const isBlob = (url: string) =>
    url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')
  if (record.thumbnailURL && isBlob(record.thumbnailURL)) return record.thumbnailURL
  if (record.url && isBlob(record.url)) return record.url
  return ''
}

interface SpeakerData {
  name: string
  email: string
  title: string
  organization: string
  country: string
  photo?: string | File
  bio: string
  type: string[]
  abstractTitle: string
  featured: boolean
  featuredOrder: number | ''
  socialMedia: {
    twitter?: string
    linkedin?: string
    website?: string
  }
  expertise: string[]
  sessions?: string[]
}

interface SpeakerFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

export default function SpeakerForm({ initialData, mode }: SpeakerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoChanged, setPhotoChanged] = useState(false)

  const initialPhotoUrl = getSpeakerPhotoBlobUrl(initialData?.photo)

  const [formData, setFormData] = useState<SpeakerData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    title: initialData?.title || '',
    organization: initialData?.organization || '',
    country: initialData?.country || '',
    photo: initialPhotoUrl,
    bio: initialData?.bio || '',
    type: initialData?.type || [],
    abstractTitle: initialData?.abstractTitle || '',
    featured: initialData?.featured || false,
    featuredOrder:
      typeof initialData?.featuredOrder === 'number' && Number.isFinite(initialData.featuredOrder)
        ? initialData.featuredOrder
        : '',
    socialMedia: initialData?.socialMedia || {
      twitter: '',
      linkedin: '',
      website: '',
    },
    expertise: initialData?.expertise?.map((e: any) => e.area).filter(Boolean) || [],
    sessions: initialData?.sessions?.map((s: any) => typeof s === 'string' ? s : s.id) || [],
  })

  useEffect(() => {
    if (initialPhotoUrl) {
      setPreviewImage(initialPhotoUrl)
    }
  }, [initialPhotoUrl])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentValue = prev[parent as keyof SpeakerData] as any
      return {
        ...prev,
        [parent]: { ...(parentValue || {}), [field]: value }
      }
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setPreviewImage(reader.result as string)
    reader.readAsDataURL(file)

    // Upload to Blob right away — store URL, not File
    setPhotoUploading(true)
    setErrors(prev => ({ ...prev, photo: '' }))
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('speakerName', formData.name || `speaker-${Date.now()}`)
      const res = await fetch('/api/upload/speaker-photo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      setFormData(prev => ({ ...prev, photo: data.url as string }))
      setPhotoChanged(true)
    } catch (err: any) {
      setErrors(prev => ({ ...prev, photo: err.message || 'Photo upload failed' }))
    } finally {
      setPhotoUploading(false)
    }
  }

  const addExpertise = () => {
    setFormData(prev => ({
      ...prev,
      expertise: [...prev.expertise, '']
    }))
  }

  const removeExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }))
  }

  const updateExpertise = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.map((item, i) => i === index ? value : item)
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.title.trim()) newErrors.title = 'Professional title is required'
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    const hasValidPhoto =
      (typeof formData.photo === 'string' && formData.photo.startsWith('https://')) ||
      (mode === 'edit' && initialPhotoUrl && !photoChanged)
    if (!hasValidPhoto) newErrors.photo = mode === 'edit' ? 'Please upload a new photo' : 'Photo is required'
    if (!formData.bio.trim()) newErrors.bio = 'Biography is required'
    if (formData.type.length === 0) newErrors.type = 'At least one speaker type is required'
    if (formData.expertise.length > 0 && formData.expertise.some(e => !e.trim())) {
      newErrors.expertise = 'Expertise areas cannot be empty'
    }

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
      // Submit speaker data and let server persist media properly.
      // This avoids creating URL-only media records that Payload can reject.
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('email', formData.email)
      submitData.append('title', formData.title)
      submitData.append('organization', formData.organization)
      submitData.append('country', formData.country)
      submitData.append('bio', formData.bio)
      submitData.append('type', JSON.stringify(formData.type))
      if (formData.abstractTitle.trim()) {
        submitData.append('abstractTitle', formData.abstractTitle.trim())
      }
      submitData.append('featured', formData.featured.toString())
      if (formData.featured && formData.featuredOrder !== '') {
        submitData.append('featuredOrder', String(formData.featuredOrder))
      }
      submitData.append('socialMedia', JSON.stringify(formData.socialMedia))
      submitData.append('expertise', JSON.stringify(formData.expertise.filter(e => e.trim())))
      
      // Only send photoUrl when the admin uploaded a new photo
      if (
        photoChanged &&
        typeof formData.photo === 'string' &&
        formData.photo.startsWith('https://')
      ) {
        submitData.append('photoUrl', formData.photo)
      }
      
      if (formData.sessions && formData.sessions.length > 0) {
        submitData.append('sessions', JSON.stringify(formData.sessions))
      }

      const url = mode === 'create' 
        ? '/api/admin/speakers'
        : `/api/admin/speakers/${initialData.id}`
      
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok) {
        // Show more detailed error message
        const errorMessage = result.error || 'Failed to save speaker'
        const details = result.details ? `: ${result.details}` : ''
        throw new Error(`${errorMessage}${details}`)
      }

      router.push('/admin/speakers')
      router.refresh()
    } catch (error: any) {
      console.error('Speaker form submission error:', error)
      setErrors({ submit: error.message || 'Failed to save speaker' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Full Name" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Dr. Jane Doe"
            />
          </FormField>

          <FormField label="Email Address" required error={errors.email} hint="Used for account creation and communications">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="speaker@example.com"
            />
          </FormField>

          <FormField label="Professional Title" required error={errors.title}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Professor of Public Health"
            />
          </FormField>

          <FormField label="Organization/Institution" required error={errors.organization}>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="University of..."
            />
          </FormField>

          <FormField label="Country" required error={errors.country}>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="mt-6">
          <FormField label="Professional Photo" required error={errors.photo} hint="Recommended: 400x400px, square format">
            <div className="space-y-4">
              {previewImage && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={
                      previewImage.startsWith('data:') ||
                      previewImage.includes('blob.vercel-storage.com')
                    }
                  />
                </div>
              )}
              <label className={`flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-fit ${photoUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                {photoUploading ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiUpload className="w-5 h-5" />}
                <span>{photoUploading ? 'Uploading…' : formData.photo ? 'Change Photo' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={photoUploading}
                />
              </label>
            </div>
          </FormField>
        </div>
      </div>

      {/* Biography */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Biography" required error={errors.bio} hint="2-3 paragraphs describing the speaker's background and expertise">
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter biography here..."
          />
        </FormField>
      </div>

      {/* Speaker Type */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Speaker Type" required error={errors.type} hint="Select all that apply">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 'keynote', label: 'Keynote Speaker' },
              { value: 'plenary', label: 'Plenary Speaker' },
              { value: 'moderator', label: 'Panel Moderator' },
              { value: 'facilitator', label: 'Workshop Facilitator' },
              { value: 'presenter', label: 'Session Presenter' },
              { value: 'abstract-presenter', label: 'Abstract Presenter' },
              { value: 'abstract-reviewer', label: 'Abstract Reviewer' },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.type.includes(value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('type', [...formData.type, value])
                    } else {
                      handleInputChange('type', formData.type.filter(t => t !== value))
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>
        </FormField>

        {/* Abstract title — shown only when abstract-presenter is selected */}
        {formData.type.includes('abstract-presenter') && (
          <div className="mt-4">
            <FormField label="Abstract Title" hint="Title of the abstract being presented">
              <input
                type="text"
                value={formData.abstractTitle}
                onChange={(e) => handleInputChange('abstractTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Sexual and Reproductive Health outcomes in SADC youth…"
              />
            </FormField>
          </div>
        )}
      </div>

      {/* Expertise Areas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <FormField label="Areas of Expertise" hint="Add areas the speaker specializes in">
            <div />
          </FormField>
          <button
            type="button"
            onClick={addExpertise}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Expertise
          </button>
        </div>
        
        {errors.expertise && (
          <p className="text-sm text-red-600 mb-2">{errors.expertise}</p>
        )}

        <div className="space-y-3">
          {formData.expertise.map((expertise, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={expertise}
                onChange={(e) => updateExpertise(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Public Health, Youth Development"
              />
              <button
                type="button"
                onClick={() => removeExpertise(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Media & Links</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <FormField label="Twitter/X Handle" hint="@username">
            <input
              type="text"
              value={formData.socialMedia.twitter || ''}
              onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="@username"
            />
          </FormField>

          <FormField label="LinkedIn URL">
            <input
              type="url"
              value={formData.socialMedia.linkedin || ''}
              onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://linkedin.com/in/..."
            />
          </FormField>

          <FormField label="Personal Website">
            <input
              type="url"
              value={formData.socialMedia.website || ''}
              onChange={(e) => handleNestedChange('socialMedia', 'website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://..."
            />
          </FormField>
        </div>
      </div>

      {/* Featured */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => {
              const checked = e.target.checked
              handleInputChange('featured', checked)
              if (!checked) {
                handleInputChange('featuredOrder', '')
              }
            }}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <div className="font-medium text-gray-900">Feature on Homepage</div>
            <div className="text-sm text-gray-500">
              Mark as featured. Only the top 3 by display order appear on the homepage; all featured speakers still show on the speakers page.
            </div>
          </div>
        </label>

        {formData.featured && (
          <FormField
            label="Homepage Display Order"
            hint="Use 1, 2, or 3 for the homepage row. Lower numbers appear first."
          >
            <input
              type="number"
              min={1}
              max={99}
              value={formData.featuredOrder}
              onChange={(e) =>
                handleInputChange(
                  'featuredOrder',
                  e.target.value === '' ? '' : Number(e.target.value),
                )
              }
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. 1"
            />
          </FormField>
        )}
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
        {mode === 'edit' && initialData?.id ? (
          <SpeakerDeleteButton
            speakerId={String(initialData.id)}
            label={formData.name || 'this speaker'}
            variant="button"
          />
        ) : (
          <div />
        )}
        <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || photoUploading}
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
              {mode === 'create' ? 'Create Speaker' : 'Save Changes'}
            </>
          )}
        </button>
        </div>
      </div>
    </form>
  )
}

