'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiUpload, FiX, FiSave, FiLoader } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { uploadFile } from '@/lib/chunkedUpload'

// Helper function to extract text from rich text format
function extractBioText(bio: any): string {
  if (!bio) return ''
  if (typeof bio === 'string') return bio
  
  // If it's a rich text object (Slate editor format)
  if (Array.isArray(bio)) {
    return bio
      .map((node: any) => {
        if (node.children) {
          return node.children.map((child: any) => child.text || '').join('')
        }
        return node.text || ''
      })
      .join(' ')
      .trim()
  }
  
  return ''
}

interface CommitteeMemberData {
  name: string
  role: string
  organization: string
  country: string
  bio: string
  email?: string
  photo?: string | File
  featured: boolean
  order: number
  socialMedia?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
}

interface YouthSteeringCommitteeFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

export default function YouthSteeringCommitteeForm({ initialData, mode }: YouthSteeringCommitteeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<CommitteeMemberData>({
    name: initialData?.name || '',
    role: initialData?.role || '',
    organization: initialData?.organization || '',
    country: initialData?.country || '',
    bio: extractBioText(initialData?.bio),
    email: initialData?.email || '',
    photo: initialData?.photo?.url || '',
    featured: initialData?.featured || false,
    order: initialData?.order || 0,
    socialMedia: {
      twitter: initialData?.socialMedia?.twitter || '',
      linkedin: initialData?.socialMedia?.linkedin || '',
      website: initialData?.socialMedia?.website || '',
    },
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value,
        },
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setErrors({ photo: 'File size must be less than 10MB' })
        e.target.value = ''
        return
      }
      if (errors.photo) {
        setErrors(prev => ({ ...prev, photo: '' }))
      }
      setFormData(prev => ({ ...prev, photo: file }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.role.trim()) newErrors.role = 'Role is required'
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required'
    if (!formData.country) newErrors.country = 'Country is required'
    if (!formData.bio || !formData.bio.trim()) newErrors.bio = 'Biography is required'
    // Photo is optional temporarily - no validation needed

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
      // Upload photo if it's a new file
      let photoUrl: string | null = null
      if (formData.photo instanceof File) {
        try {
          console.log('📤 Uploading committee member photo directly to blob storage...', {
            name: formData.photo.name,
            size: formData.photo.size,
            type: formData.photo.type,
          })

          const sanitizedName = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100)
          const fileExt = formData.photo.name.split('.').pop() || 'jpg'
          const pathname = `YouthSteeringCommittee/${sanitizedName}.${fileExt}`

          const { upload } = await import('@vercel/blob/client')
          
          const blob = await upload(pathname, formData.photo, {
            access: 'public',
            handleUploadUrl: '/api/upload/speaker-photo/presigned-url',
            clientPayload: JSON.stringify({
              addRandomSuffix: true,
            }),
          })

          console.log('📦 Blob upload response:', {
            hasUrl: !!blob.url,
            url: blob.url,
            blobKeys: Object.keys(blob),
            fullBlob: blob,
          })

          if (!blob.url) {
            throw new Error('Blob upload succeeded but no URL returned in response')
          }

          photoUrl = blob.url
          console.log('✅ Committee member photo uploaded directly to Vercel Blob:', photoUrl)
        } catch (uploadError: any) {
          console.error('❌ Photo upload error:', uploadError)
          setErrors({ submit: `Failed to upload photo: ${uploadError.message}` })
          setLoading(false)
          return
        }
      } else if (typeof formData.photo === 'string') {
        photoUrl = formData.photo
      }

      // Validate photoUrl format if provided (optional temporarily)
      if (photoUrl && (typeof photoUrl !== 'string' || !photoUrl.startsWith('https://'))) {
        console.error('❌ Invalid photoUrl before submission:', {
          photoUrl,
          type: typeof photoUrl,
          isString: typeof photoUrl === 'string',
          startsWithHttps: typeof photoUrl === 'string' && photoUrl.startsWith('https://'),
        })
        setErrors({ submit: 'Invalid photo URL format. Please upload a photo again or skip it.' })
        setLoading(false)
        return
      }

      // Submit the member data
      console.log('📤 Submitting member data with photoUrl:', {
        hasPhotoUrl: !!photoUrl,
        photoUrl: photoUrl ? photoUrl.substring(0, 100) : null,
        photoUrlLength: photoUrl ? photoUrl.length : 0,
      })

      const memberPayload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        organization: formData.organization.trim(),
        country: formData.country,
        bio: formData.bio,
        email: formData.email?.trim() || undefined,
        featured: formData.featured,
        order: formData.order || 0,
        socialMedia: formData.socialMedia,
        photoUrl: photoUrl, // Ensure this is a valid string URL
      }

      const url = mode === 'create' 
        ? '/api/admin/youth-steering-committee'
        : `/api/admin/youth-steering-committee/${initialData.id}`
      
      const method = mode === 'create' ? 'POST' : 'PATCH'

      // Use FormData like speakers route - this matches the API expectation
      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('role', formData.role.trim())
      submitData.append('organization', formData.organization.trim())
      submitData.append('country', formData.country)
      submitData.append('bio', formData.bio)
      submitData.append('featured', formData.featured.toString())
      submitData.append('order', (formData.order || 0).toString())
      submitData.append('socialMedia', JSON.stringify(formData.socialMedia))
      
      if (formData.email) {
        submitData.append('email', formData.email.trim())
      }
      
      // Send photo URL instead of file
      if (photoUrl) {
        submitData.append('photoUrl', photoUrl)
      }

      // Ensure we're using FormData correctly - browser will set Content-Type automatically
      // DO NOT set Content-Type header manually - browser sets it with boundary
      console.log('📤 Submitting FormData:', {
        hasPhotoUrl: !!photoUrl,
        formDataKeys: Array.from(submitData.keys()),
      })
      
      const response = await fetch(url, {
        method,
        body: submitData, // FormData - browser sets Content-Type: multipart/form-data automatically
        // Explicitly DO NOT set headers - let browser handle Content-Type
      })

      if (!response.ok) {
        let errorMessage = 'Failed to save committee member'
        let errorDetails: any = {}
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          errorDetails = errorData
          console.error('❌ API Error Response:', errorData)
        } catch (e) {
          errorMessage = response.statusText || errorMessage
        }
        
        // Show more detailed error message
        const detailedMessage = errorDetails.details 
          ? `${errorMessage}: ${errorDetails.details}`
          : errorMessage
        
        throw new Error(detailedMessage)
      }

      const result = await response.json()

      router.push('/admin/youth-steering-committee')
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Member Information</h2>
        
        <div className="space-y-6">
          <FormField label="Full Name" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </FormField>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Role/Position" required error={errors.role}>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Chairperson, Vice Chair, Member"
              />
            </FormField>

            <FormField label="Organization/Institution" required error={errors.organization}>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter organization name"
              />
            </FormField>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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

            <FormField label="Email Address" error={errors.email}>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional email address"
              />
            </FormField>
          </div>

          <FormField label="Biography" required error={errors.bio} hint="Brief biography (2-3 paragraphs)">
            <textarea
              value={typeof formData.bio === 'string' ? formData.bio : ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter biography here..."
            />
          </FormField>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Profile Photo" error={errors.photo} hint="Upload profile photo (max 10MB). Photos are uploaded directly to blob storage. (Optional)">
          <div className="space-y-4">
            {formData.photo && typeof formData.photo === 'string' && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Current photo: {formData.photo}</p>
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
            {formData.photo instanceof File && (
              <p className="text-sm text-gray-600">Selected: {formData.photo.name}</p>
            )}
          </div>
        </FormField>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Media Links</h2>
        
        <div className="space-y-4">
          <FormField label="Twitter/X Handle">
            <input
              type="text"
              value={formData.socialMedia?.twitter || ''}
              onChange={(e) => handleInputChange('socialMedia.twitter', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="@username"
            />
          </FormField>

          <FormField label="LinkedIn URL">
            <input
              type="url"
              value={formData.socialMedia?.linkedin || ''}
              onChange={(e) => handleInputChange('socialMedia.linkedin', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://linkedin.com/in/username"
            />
          </FormField>

          <FormField label="Personal Website">
            <input
              type="url"
              value={formData.socialMedia?.website || ''}
              onChange={(e) => handleInputChange('socialMedia.website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </FormField>
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Display Options</h2>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <div className="font-medium text-gray-900">Feature on Homepage</div>
              <div className="text-sm text-gray-500">Display this member prominently on the homepage</div>
            </div>
          </label>

          <FormField label="Display Order" hint="Lower numbers appear first. Use this to control the order of display.">
            <input
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>
        </div>
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
              {mode === 'create' ? 'Create Member' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
