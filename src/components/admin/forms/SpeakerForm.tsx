'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiUpload, FiX, FiPlus, FiSave, FiLoader } from 'react-icons/fi'
import Image from 'next/image'
import { countries } from '@/lib/countries'

interface SpeakerData {
  name: string
  title: string
  organization: string
  country: string
  photo?: string | File
  bio: string
  type: string[]
  featured: boolean
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

  const [formData, setFormData] = useState<SpeakerData>({
    name: initialData?.name || '',
    title: initialData?.title || '',
    organization: initialData?.organization || '',
    country: initialData?.country || '',
    photo: initialData?.photo?.url || '',
    bio: initialData?.bio || '',
    type: initialData?.type || [],
    featured: initialData?.featured || false,
    socialMedia: initialData?.socialMedia || {
      twitter: '',
      linkedin: '',
      website: '',
    },
    expertise: initialData?.expertise?.map((e: any) => e.area).filter(Boolean) || [],
    sessions: initialData?.sessions?.map((s: any) => typeof s === 'string' ? s : s.id) || [],
  })

  useEffect(() => {
    if (initialData?.photo?.url) {
      setPreviewImage(initialData.photo.url)
    }
  }, [initialData])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
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
    if (!formData.title.trim()) newErrors.title = 'Professional title is required'
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.photo && !initialData?.photo) newErrors.photo = 'Photo is required'
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
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('title', formData.title)
      submitData.append('organization', formData.organization)
      submitData.append('country', formData.country)
      submitData.append('bio', formData.bio)
      submitData.append('type', JSON.stringify(formData.type))
      submitData.append('featured', formData.featured.toString())
      submitData.append('socialMedia', JSON.stringify(formData.socialMedia))
      submitData.append('expertise', JSON.stringify(formData.expertise.filter(e => e.trim())))
      
      if (formData.photo instanceof File) {
        submitData.append('photo', formData.photo)
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
        throw new Error(result.error || 'Failed to save speaker')
      }

      router.push('/admin/speakers')
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
                  />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-fit">
                <FiUpload className="w-5 h-5" />
                <span>{formData.photo ? 'Change Photo' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
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
            {['keynote', 'plenary', 'moderator', 'facilitator', 'presenter'].map((type) => (
              <label key={type} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.type.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('type', [...formData.type, type])
                    } else {
                      handleInputChange('type', formData.type.filter(t => t !== type))
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="capitalize">{type === 'plenary' ? 'Plenary' : type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </label>
            ))}
          </div>
        </FormField>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) => handleInputChange('featured', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <div className="font-medium text-gray-900">Feature on Homepage</div>
            <div className="text-sm text-gray-500">Display this speaker prominently on the homepage</div>
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
              {mode === 'create' ? 'Create Speaker' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

