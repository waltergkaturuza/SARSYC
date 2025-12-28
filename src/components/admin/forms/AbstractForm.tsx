'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiUpload, FiX, FiPlus, FiSave, FiLoader } from 'react-icons/fi'
import { countries } from '@/lib/countries'
import { showToast } from '@/lib/toast'

interface AuthorData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  organization: string
  country: string
}

interface CoAuthorData {
  name: string
  organization?: string
}

interface AbstractData {
  title: string
  abstract: string
  keywords: string[]
  track: string
  primaryAuthor: AuthorData
  coAuthors: CoAuthorData[]
  presentationType: string
  abstractFile?: string | File
  status: string
  reviewerComments?: string
  adminNotes?: string
  assignedSession?: string
}

interface AbstractFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

export default function AbstractForm({ initialData, mode }: AbstractFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<AbstractData>({
    title: initialData?.title || '',
    abstract: initialData?.abstract || '',
    keywords: initialData?.keywords?.map((k: any) => k.keyword || k).filter(Boolean) || [],
    track: initialData?.track || '',
    primaryAuthor: initialData?.primaryAuthor || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      organization: '',
      country: '',
    },
    coAuthors: initialData?.coAuthors?.map((ca: any) => ({
      name: ca.name || '',
      organization: ca.organization || '',
    })) || [],
    presentationType: initialData?.presentationType || 'either',
    status: initialData?.status || 'received',
    reviewerComments: initialData?.reviewerComments || '',
    adminNotes: initialData?.adminNotes || '',
    assignedSession: initialData?.assignedSession?.id || initialData?.assignedSession || '',
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAuthorChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      primaryAuthor: { ...prev.primaryAuthor, [field]: value }
    }))
  }

  const addKeyword = () => {
    setFormData(prev => ({ ...prev, keywords: [...prev.keywords, ''] }))
  }

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }))
  }

  const updateKeyword = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((item, i) => i === index ? value : item)
    }))
  }

  const addCoAuthor = () => {
    setFormData(prev => ({
      ...prev,
      coAuthors: [...prev.coAuthors, { name: '', organization: '' }]
    }))
  }

  const removeCoAuthor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coAuthors: prev.coAuthors.filter((_, i) => i !== index)
    }))
  }

  const updateCoAuthor = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      coAuthors: prev.coAuthors.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, abstractFile: file }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.abstract.trim()) newErrors.abstract = 'Abstract text is required'
    if (formData.abstract.length > 2000) newErrors.abstract = 'Abstract must be 2000 characters or less'
    if (formData.keywords.length < 3) newErrors.keywords = 'At least 3 keywords are required'
    if (formData.keywords.length > 5) newErrors.keywords = 'Maximum 5 keywords allowed'
    if (formData.keywords.some(k => !k.trim())) newErrors.keywords = 'Keywords cannot be empty'
    if (!formData.track) newErrors.track = 'Track selection is required'
    if (!formData.primaryAuthor.firstName.trim()) newErrors['primaryAuthor.firstName'] = 'First name is required'
    if (!formData.primaryAuthor.lastName.trim()) newErrors['primaryAuthor.lastName'] = 'Last name is required'
    if (!formData.primaryAuthor.email.trim()) newErrors['primaryAuthor.email'] = 'Email is required'
    if (!formData.primaryAuthor.email.includes('@')) newErrors['primaryAuthor.email'] = 'Valid email is required'
    if (!formData.primaryAuthor.organization.trim()) newErrors['primaryAuthor.organization'] = 'Organization is required'
    if (!formData.primaryAuthor.country.trim()) newErrors['primaryAuthor.country'] = 'Country is required'

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
      submitData.append('title', formData.title)
      submitData.append('abstract', formData.abstract)
      submitData.append('keywords', JSON.stringify(formData.keywords.filter(k => k.trim())))
      submitData.append('track', formData.track)
      submitData.append('primaryAuthor', JSON.stringify(formData.primaryAuthor))
      submitData.append('coAuthors', JSON.stringify(formData.coAuthors.filter(ca => ca.name.trim())))
      submitData.append('presentationType', formData.presentationType)
      submitData.append('status', formData.status)
      
      // Always include these fields, even if empty (to allow clearing)
      submitData.append('reviewerComments', formData.reviewerComments || '')
      submitData.append('adminNotes', formData.adminNotes || '')
      
      if (formData.assignedSession) {
        submitData.append('assignedSession', formData.assignedSession)
      }
      
      if (formData.abstractFile instanceof File) {
        submitData.append('abstractFile', formData.abstractFile)
      }

      const url = mode === 'create' 
        ? '/api/admin/abstracts'
        : `/api/admin/abstracts/${initialData.id}`
      
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        body: submitData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save abstract')
      }

      // Show success message
      showToast.success('Abstract updated successfully')

      router.push('/admin/abstracts')
      router.refresh()
    } catch (error: any) {
      console.error('Abstract save error:', error)
      showToast.error(error.message || 'Failed to save abstract')
      setErrors({ submit: error.message || 'Failed to save abstract' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Abstract Information</h2>
        
        <div className="space-y-6">
          <FormField label="Abstract Title" required error={errors.title}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter the title of your abstract"
            />
          </FormField>

          <FormField label="Abstract Text" required error={errors.abstract} hint={`${formData.abstract.length}/2000 characters (300 words max)`}>
            <textarea
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              rows={12}
              maxLength={2000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your abstract text here..."
            />
          </FormField>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField label="Conference Track" required error={errors.track}>
              <select
                value={formData.track}
                onChange={(e) => handleInputChange('track', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a track</option>
                <option value="srhr">Track 1: Youth Sexual & Reproductive Health</option>
                <option value="education">Track 2: Education & Skills Development</option>
                <option value="advocacy">Track 3: Advocacy & Policy Influence</option>
                <option value="innovation">Track 4: Innovation & Technology for Youth</option>
              </select>
            </FormField>

            <FormField label="Preferred Presentation Type" required>
              <select
                value={formData.presentationType}
                onChange={(e) => handleInputChange('presentationType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="oral">Oral Presentation</option>
                <option value="poster">Poster Presentation</option>
                <option value="either">Either</option>
              </select>
            </FormField>
          </div>

          {/* Keywords */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <FormField label="Keywords" required error={errors.keywords} hint="3-5 keywords (${formData.keywords.length}/5)">
                <div />
              </FormField>
              {formData.keywords.length < 5 && (
                <button
                  type="button"
                  onClick={addKeyword}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Keyword
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.keywords.map((keyword, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`Keyword ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Author */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Primary Author</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="First Name" required error={errors['primaryAuthor.firstName']}>
            <input
              type="text"
              value={formData.primaryAuthor.firstName}
              onChange={(e) => handleAuthorChange('firstName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="Last Name" required error={errors['primaryAuthor.lastName']}>
            <input
              type="text"
              value={formData.primaryAuthor.lastName}
              onChange={(e) => handleAuthorChange('lastName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="Email" required error={errors['primaryAuthor.email']}>
            <input
              type="email"
              value={formData.primaryAuthor.email}
              onChange={(e) => handleAuthorChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="Phone" error={errors['primaryAuthor.phone']}>
            <input
              type="tel"
              value={formData.primaryAuthor.phone || ''}
              onChange={(e) => handleAuthorChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="Organization" required error={errors['primaryAuthor.organization']}>
            <input
              type="text"
              value={formData.primaryAuthor.organization}
              onChange={(e) => handleAuthorChange('organization', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>

          <FormField label="Country" required error={errors['primaryAuthor.country']}>
            <select
              value={formData.primaryAuthor.country}
              onChange={(e) => handleAuthorChange('country', e.target.value)}
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
      </div>

      {/* Co-Authors */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Co-Authors</h2>
          <button
            type="button"
            onClick={addCoAuthor}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Co-Author
          </button>
        </div>

        <div className="space-y-4">
          {formData.coAuthors.map((coAuthor, index) => (
            <div key={index} className="grid md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={coAuthor.name}
                onChange={(e) => updateCoAuthor(index, 'name', e.target.value)}
                placeholder="Full Name"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <input
                type="text"
                value={coAuthor.organization || ''}
                onChange={(e) => updateCoAuthor(index, 'organization', e.target.value)}
                placeholder="Organization (optional)"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeCoAuthor(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ))}
          {formData.coAuthors.length === 0 && (
            <p className="text-gray-500 text-center py-4">No co-authors added</p>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Upload Abstract (PDF/Word)" hint="Optional: Upload a formatted version of your abstract">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors w-fit">
            <FiUpload className="w-5 h-5" />
            <span>{formData.abstractFile ? 'Change File' : 'Upload File'}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {formData.abstractFile && (
            <p className="mt-2 text-sm text-gray-600">
              {formData.abstractFile instanceof File ? formData.abstractFile.name : 'File uploaded'}
            </p>
          )}
        </FormField>
      </div>

      {/* Admin Fields (Edit Mode) */}
      {mode === 'edit' && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Status</h2>
            
            <div className="space-y-6">
              <FormField label="Status" required>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="received">Received</option>
                  <option value="under-review">Under Review</option>
                  <option value="revisions">Revisions Requested</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </FormField>

              {(formData.status === 'revisions' || formData.status === 'rejected') && (
                <FormField label="Reviewer Comments">
                  <textarea
                    value={formData.reviewerComments || ''}
                    onChange={(e) => handleInputChange('reviewerComments', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter reviewer comments..."
                  />
                </FormField>
              )}

              {formData.status === 'accepted' && (
                <FormField label="Assigned Session">
                  <input
                    type="text"
                    value={formData.assignedSession || ''}
                    onChange={(e) => handleInputChange('assignedSession', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Session ID"
                  />
                </FormField>
              )}

              <FormField label="Admin Notes" hint="Internal notes (not visible to author)">
                <textarea
                  value={formData.adminNotes || ''}
                  onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Internal admin notes..."
                />
              </FormField>
            </div>
          </div>
        </>
      )}

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
              {mode === 'create' ? 'Submit Abstract' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

