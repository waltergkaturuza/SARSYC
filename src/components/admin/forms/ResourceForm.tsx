'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiUpload, FiX, FiPlus, FiSave, FiLoader } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { uploadFile } from '@/lib/chunkedUpload'

interface ResourceData {
  title: string
  slug: string
  description: string
  file?: string | File
  type: string
  topics: string[]
  year: number
  sarsycEdition?: string
  authors: string[]
  country?: string
  language: string
  featured: boolean
}

interface ResourceFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

export default function ResourceForm({ initialData, mode }: ResourceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  const [formData, setFormData] = useState<ResourceData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    file: initialData?.file?.url || '',
    type: initialData?.type || '',
    topics: initialData?.topics || [],
    year: initialData?.year || new Date().getFullYear(),
    sarsycEdition: initialData?.sarsycEdition || '',
    authors: initialData?.authors?.map((a: any) => a.author || a).filter(Boolean) || [],
    country: initialData?.country || '',
    language: initialData?.language || 'en',
    featured: initialData?.featured || false,
  })

  // Auto-generate slug when title changes (only if slug is empty or matches old title)
  React.useEffect(() => {
    if (mode === 'create' && formData.title && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))
    }
  }, [formData.title, mode])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Allow files up to 100MB with automatic chunking for large files
      const maxSize = 100 * 1024 * 1024 // 100MB in bytes
      if (file.size > maxSize) {
        setErrors({ file: 'File size must be less than 100MB' })
        e.target.value = '' // Clear the input
        return
      }
      // Clear any previous file errors
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }))
      }
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const addAuthor = () => {
    setFormData(prev => ({ ...prev, authors: [...prev.authors, ''] }))
  }

  const removeAuthor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }))
  }

  const updateAuthor = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.map((item, i) => i === index ? value : item)
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.file && !initialData?.file) newErrors.file = 'File is required'
    if (!formData.type) newErrors.type = 'Resource type is required'
    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = 'Valid year is required (2000-2100)'
    }
    if (formData.authors.some(a => !a.trim())) newErrors.authors = 'Author names cannot be empty'

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
      // CLIENT-SIDE DIRECT UPLOAD: Upload file directly to Vercel Blob (bypasses serverless limit)
      let fileUrl: string | null = null
      if (formData.file instanceof File) {
        try {
          console.log('📤 Uploading resource file directly to blob storage...', {
            name: formData.file.name,
            size: formData.file.size,
            type: formData.file.type,
          })

          // Build filename
          const editionMap: Record<string, string> = {
            '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI', 'other': 'general',
          }
          const edition = formData.sarsycEdition ? editionMap[formData.sarsycEdition] || formData.sarsycEdition : 'general'
          const typeFolder = formData.type || 'other'
          
          let pathname: string
          if (formData.title) {
            const sanitizedTitle = formData.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .substring(0, 100)
            const fileExt = formData.file.name.split('.').pop() || 'pdf'
            pathname = `Resources/sarsyc_${edition}/${typeFolder}/${sanitizedTitle}.${fileExt}`
          } else {
            const sanitizedFilename = formData.file.name
              .replace(/\s+/g, '-')
              .replace(/[^a-zA-Z0-9.-]/g, '-')
              .toLowerCase()
            pathname = `Resources/sarsyc_${edition}/${typeFolder}/${sanitizedFilename}`
          }

          // Use Vercel Blob client-side upload with addRandomSuffix to avoid conflicts
          const { upload } = await import('@vercel/blob/client')
          
          const blob = await upload(pathname, formData.file, {
            access: 'public',
            handleUploadUrl: '/api/upload/resource/presigned-url',
            clientPayload: JSON.stringify({
              addRandomSuffix: true,
            }),
          })

          fileUrl = blob.url
          console.log('✅ Resource file uploaded directly to Vercel Blob:', fileUrl)
        } catch (uploadError: any) {
          console.error('❌ Resource upload error:', uploadError)
          setErrors({ submit: `Failed to upload file: ${uploadError.message}` })
          setLoading(false)
          return
        }
      } else if (typeof formData.file === 'string') {
        // File is already a URL (from existing resource)
        fileUrl = formData.file
      }

      // Now submit the resource data with the file URL as JSON (not FormData)
      // This matches how registration handles passport uploads
      const resourcePayload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        type: formData.type,
        topics: Array.isArray(formData.topics) ? formData.topics : [],
        year: formData.year,
        sarsycEdition: formData.sarsycEdition || undefined,
        authors: formData.authors.filter(a => a && a.trim()),
        country: formData.country || undefined,
        language: formData.language,
        featured: formData.featured,
        fileUrl: fileUrl, // Send blob URL as part of JSON payload
      }

      const url = mode === 'create' 
        ? '/api/admin/resources'
        : `/api/admin/resources/${initialData.id}`
      
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resourcePayload),
      })

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Failed to save resource'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      router.push('/admin/resources')
      router.refresh()
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const resourceTypes = [
    { value: 'concept-note', label: 'Concept Note' },
    { value: 'report', label: 'Conference Report' },
    { value: 'symposium-report', label: 'Symposium Report' },
    { value: 'paper', label: 'Research Paper' },
    { value: 'brief', label: 'Policy Brief' },
    { value: 'communique', label: 'Communiqué' },
    { value: 'declaration', label: 'Declaration' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'template', label: 'Template' },
    { value: 'toolkit', label: 'Toolkit' },
    { value: 'infographic', label: 'Infographic' },
    { value: 'video', label: 'Video' },
    { value: 'other', label: 'Other' },
  ]

  const topics = [
    { value: 'srh', label: 'Sexual & Reproductive Health' },
    { value: 'education', label: 'Education' },
    { value: 'advocacy', label: 'Advocacy' },
    { value: 'policy', label: 'Policy' },
    { value: 'innovation', label: 'Innovation' },
    { value: 'empowerment', label: 'Youth Empowerment' },
    { value: 'gender', label: 'Gender' },
    { value: 'hiv', label: 'HIV/AIDS' },
    { value: 'research', label: 'Research' },
  ]

  const sarsycEditions = [
    { value: '1', label: 'SARSYC I (2015)' },
    { value: '2', label: 'SARSYC II (2017)' },
    { value: '3', label: 'SARSYC III (2019)' },
    { value: '4', label: 'SARSYC IV (2022)' },
    { value: '5', label: 'SARSYC V (2024)' },
    { value: '6', label: 'SARSYC VI (2026)' },
    { value: 'other', label: 'Other/General' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Resource Information</h2>
        
        <div className="space-y-6">
          <FormField label="Resource Title" required error={errors.title}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter resource title"
            />
          </FormField>

          <FormField label="URL Slug" required error={errors.slug} hint="Auto-generated from title">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="resource-url-slug"
            />
          </FormField>

          <FormField label="Description" required error={errors.description}>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter resource description..."
            />
          </FormField>

          <div className="grid md:grid-cols-3 gap-6">
            <FormField label="Resource Type" required error={errors.type}>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Year" required error={errors.year}>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                min="2000"
                max="2100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </FormField>

            <FormField label="SARSYC Edition">
              <select
                value={formData.sarsycEdition || ''}
                onChange={(e) => handleInputChange('sarsycEdition', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select edition (optional)</option>
                {sarsycEditions.map((edition) => (
                  <option key={edition.value} value={edition.value}>
                    {edition.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Resource File" required error={errors.file} hint="Upload PDF, Word document, or other resource file (max 100MB). Files are uploaded directly to blob storage (bypassing serverless limits) and organized by SARSYC edition and resource type.">
          <div className="space-y-4">
            {formData.file && typeof formData.file === 'string' && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Current file: {formData.file}</p>
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-fit">
              <FiUpload className="w-5 h-5" />
              <span>{formData.file ? 'Change File' : 'Upload File'}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {formData.file instanceof File && (
              <p className="text-sm text-gray-600">Selected: {formData.file.name}</p>
            )}
          </div>
        </FormField>
      </div>

      {/* Topics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Topics" hint="Select relevant topics">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {topics.map((topic) => (
              <label key={topic.value} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.topics.includes(topic.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('topics', [...formData.topics, topic.value])
                    } else {
                      handleInputChange('topics', formData.topics.filter(t => t !== topic.value))
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{topic.label}</span>
              </label>
            ))}
          </div>
        </FormField>
      </div>

      {/* Authors */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <FormField label="Authors" hint="List all authors of this resource">
            <div />
          </FormField>
          <button
            type="button"
            onClick={addAuthor}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Author
          </button>
        </div>
        {errors.authors && (
          <p className="text-sm text-red-600 mb-2">{errors.authors}</p>
        )}
        <div className="space-y-3">
          {formData.authors.map((author, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={author}
                onChange={(e) => updateAuthor(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Author name"
              />
              <button
                type="button"
                onClick={() => removeAuthor(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Metadata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Metadata</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Country/Region" hint="Optional">
            <select
              value={formData.country || ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Select country (optional)</option>
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Language">
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
            </select>
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
            <div className="font-medium text-gray-900">Feature on Resource Page</div>
            <div className="text-sm text-gray-500">Display this resource prominently</div>
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
              {mode === 'create' ? 'Create Resource' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

