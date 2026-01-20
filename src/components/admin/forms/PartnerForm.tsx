'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiUpload, FiSave, FiLoader } from 'react-icons/fi'
import Image from 'next/image'

interface PartnerData {
  name: string
  logo?: string | File
  description: string
  type: string
  tier?: string
  website?: string
  active: boolean
  sarsycEditions: string[]
  displayOrder?: number
}

interface PartnerFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

export default function PartnerForm({ initialData, mode }: PartnerFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [formData, setFormData] = useState<PartnerData>({
    name: initialData?.name || '',
    logo: initialData?.logo?.url || '',
    description: initialData?.description || '',
    type: initialData?.type || '',
    tier: initialData?.tier || '',
    website: initialData?.website || '',
    active: initialData?.active !== undefined ? initialData.active : true,
    sarsycEditions: initialData?.sarsycEditions || [],
    displayOrder: initialData?.displayOrder || undefined,
  })

  useEffect(() => {
    if (initialData?.logo?.url) {
      setPreviewImage(initialData.logo.url)
    }
  }, [initialData])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, logo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Partner name is required'
    if (!formData.logo && !initialData?.logo) newErrors.logo = 'Logo is required'
    if (!formData.type) newErrors.type = 'Partnership type is required'
    if (formData.type === 'sponsor' && !formData.tier) newErrors.tier = 'Sponsorship tier is required for sponsors'

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
      // CLIENT-SIDE DIRECT UPLOAD: Upload logo directly to blob storage
      let logoUrl: string | null = null
      if (formData.logo instanceof File) {
        try {
          console.log('📤 Uploading partner logo directly to blob storage...', {
            name: formData.logo.name,
            size: formData.logo.size,
            type: formData.logo.type,
          })

          // Build pathname for organized storage
          const nameHash = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50)
          const fileExt = formData.logo.name.split('.').pop()?.toLowerCase() || 'png'
          const pathname = `Partners/logos/${nameHash}.${fileExt}`

          // Use Vercel Blob client-side upload with presigned URL
          const { upload } = await import('@vercel/blob/client')
          
          const blob = await upload(pathname, formData.logo, {
            access: 'public',
            handleUploadUrl: '/api/upload/partner-logo/presigned-url',
            clientPayload: JSON.stringify({
              addRandomSuffix: true,
            }),
          })

          logoUrl = blob.url
          console.log('✅ Partner logo uploaded directly to Vercel Blob:', logoUrl)
        } catch (uploadError: any) {
          console.error('❌ Logo upload error:', uploadError)
          setErrors({ submit: `Failed to upload logo: ${uploadError.message}` })
          setLoading(false)
          return
        }
      } else if (typeof formData.logo === 'string') {
        // Logo is already a URL (from existing partner)
        logoUrl = formData.logo
      }

      // Now submit the partner data with the logo URL
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description || '')
      submitData.append('type', formData.type)
      if (formData.tier) {
        submitData.append('tier', formData.tier)
      }
      if (formData.website) {
        submitData.append('website', formData.website)
      }
      submitData.append('active', formData.active.toString())
      submitData.append('sarsycEditions', JSON.stringify(formData.sarsycEditions))
      if (formData.displayOrder !== undefined) {
        submitData.append('displayOrder', formData.displayOrder.toString())
      }
      
      // Append logo URL instead of file object
      if (logoUrl) {
        submitData.append('logoUrl', logoUrl)
      }

      const url = mode === 'create' 
        ? '/api/admin/partners'
        : `/api/admin/partners/${initialData.id}`
      
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save partner')
      }

      router.push('/admin/partners')
      router.refresh()
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const partnershipTypes = [
    { value: 'implementing', label: 'Implementing Partner' },
    { value: 'funding', label: 'Funding Partner' },
    { value: 'technical', label: 'Technical Partner' },
    { value: 'media', label: 'Media Partner' },
    { value: 'sponsor', label: 'Sponsor' },
  ]

  const sponsorshipTiers = [
    { value: 'platinum', label: 'Platinum' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'bronze', label: 'Bronze' },
    { value: 'in-kind', label: 'In-Kind' },
    { value: 'n/a', label: 'Not Applicable' },
  ]

  const sarsycEditions = [
    { value: '1', label: 'SARSYC I (2014)' },
    { value: '2', label: 'SARSYC II (2016)' },
    { value: '3', label: 'SARSYC III (2018)' },
    { value: '4', label: 'SARSYC IV (2020)' },
    { value: '5', label: 'SARSYC V (2022)' },
    { value: '6', label: 'SARSYC VI (2026)' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Partner Information</h2>
        
        <div className="space-y-6">
          <FormField label="Partner/Organization Name" required error={errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Organization name"
            />
          </FormField>

          <FormField label="Logo" required error={errors.logo} hint="Recommended: Square format, transparent background">
            <div className="space-y-4">
              {previewImage && (
                <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
                  <Image
                    src={previewImage}
                    alt="Logo preview"
                    fill
                    className="object-contain p-4"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-fit">
                <FiUpload className="w-5 h-5" />
                <span>{formData.logo ? 'Change Logo' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </FormField>

          <FormField label="About the Partner">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Description of the partner organization..."
            />
          </FormField>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Partnership Type" required error={errors.type}>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                {partnershipTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>

            {formData.type === 'sponsor' && (
              <FormField label="Sponsorship Tier" required error={errors.tier}>
                <select
                  value={formData.tier || ''}
                  onChange={(e) => handleInputChange('tier', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select tier</option>
                  {sponsorshipTiers.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Website URL" hint="Optional">
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://..."
              />
            </FormField>

            <FormField label="Display Order" hint="Lower numbers appear first">
              <input
                type="number"
                value={formData.displayOrder || ''}
                onChange={(e) => handleInputChange('displayOrder', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* SARSYC Editions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Partnered at SARSYC Editions" hint="Select all editions this partner has been involved with">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {sarsycEditions.map((edition) => (
              <label key={edition.value} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.sarsycEditions.includes(edition.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('sarsycEditions', [...formData.sarsycEditions, edition.value])
                    } else {
                      handleInputChange('sarsycEditions', formData.sarsycEditions.filter(e => e !== edition.value))
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{edition.label}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* Active Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => handleInputChange('active', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <div>
            <div className="font-medium text-gray-900">Currently Active</div>
            <div className="text-sm text-gray-500">Display this partner on the website</div>
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
              {mode === 'create' ? 'Create Partner' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}



