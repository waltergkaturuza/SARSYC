'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiUpload, FiX, FiPlus, FiSave, FiLoader, FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import Image from 'next/image'
import { slateToPlainText } from '@/lib/newsContent'
import { getMediaDisplayUrl } from '@/lib/mediaDisplayUrl'

interface NewsData {
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string | File
  category: string[]
  tags: string[]
  author: string
  status: string
  publishedDate?: string
  featured: boolean
}

interface NewsFormProps {
  initialData?: any
  mode: 'create' | 'edit'
  users?: any[]
}

export default function NewsForm({ initialData, mode, users = [] }: NewsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [broadcasting, setBroadcasting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [broadcastMessage, setBroadcastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }

  const [formData, setFormData] = useState<NewsData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: slateToPlainText(initialData?.content) || '',
    featuredImage: initialData?.featuredImage?.url || '',
    category: initialData?.category || [],
    tags: initialData?.tags?.map((t: any) => t.tag || t).filter(Boolean) || [],
    author: initialData?.author?.id || initialData?.author || '',
    status: initialData?.status || 'draft',
    publishedDate: initialData?.publishedDate ? new Date(initialData.publishedDate).toISOString().slice(0, 16) : '',
    featured: initialData?.featured || false,
  })

  useEffect(() => {
    const preview = getMediaDisplayUrl(initialData?.featuredImage)
    if (preview) setPreviewImage(preview)
  }, [initialData])

  // Auto-generate slug when title changes (only if slug is empty or matches old title)
  useEffect(() => {
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
      setFormData(prev => ({ ...prev, featuredImage: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addTag = () => {
    setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] }))
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((item, i) => i === index ? value : item)
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required'
    if (formData.excerpt.length > 200) newErrors.excerpt = 'Excerpt must be 200 characters or less'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    if (!formData.featuredImage && !initialData?.featuredImage) newErrors.featuredImage = 'Featured image is required'
    if (formData.category.length === 0) newErrors.category = 'At least one category is required'
    if (!formData.author) newErrors.author = 'Author is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSubscribers = async () => {
    if (!initialData?.id) return

    if (formData.status !== 'published') {
      setBroadcastMessage({
        type: 'error',
        text: 'Publish this article first before emailing subscribers.',
      })
      return
    }

    const confirmed = window.confirm(
      'Send this article to all active newsletter subscribers? This will email everyone on the subscription list.',
    )
    if (!confirmed) return

    setBroadcasting(true)
    setBroadcastMessage(null)

    try {
      const response = await fetch(
        `/api/admin/news/${initialData.id}/broadcast-newsletter`,
        { method: 'POST', credentials: 'include' },
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to email subscribers')
      }

      const sent = result.newsletterBroadcast?.sent ?? 0
      const failed = result.newsletterBroadcast?.failed ?? 0
      setBroadcastMessage({
        type: 'success',
        text:
          failed > 0
            ? `Newsletter sent to ${sent} subscriber(s). ${failed} failed.`
            : `Newsletter sent to ${sent} subscriber(s).`,
      })
    } catch (err: unknown) {
      setBroadcastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to email subscribers',
      })
    } finally {
      setBroadcasting(false)
    }
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
      submitData.append('slug', formData.slug)
      submitData.append('excerpt', formData.excerpt)
      submitData.append('content', formData.content)
      submitData.append('category', JSON.stringify(formData.category))
      submitData.append('tags', JSON.stringify(formData.tags.filter(t => t.trim())))
      submitData.append('author', formData.author)
      submitData.append('status', formData.status)
      submitData.append('featured', formData.featured.toString())
      
      if (formData.publishedDate && formData.status === 'published') {
        submitData.append('publishedDate', new Date(formData.publishedDate).toISOString())
      }
      
      if (formData.featuredImage instanceof File && formData.featuredImage.size > 0) {
        submitData.append('featuredImage', formData.featuredImage, formData.featuredImage.name)
      } else if (initialData?.featuredImage?.id) {
        submitData.append('featuredImageId', String(initialData.featuredImage.id))
      } else if (
        typeof formData.featuredImage === 'string' &&
        formData.featuredImage.startsWith('https://') &&
        !formData.featuredImage.includes('/api/media/file/')
      ) {
        submitData.append('featuredImageUrl', formData.featuredImage)
      }

      const url = mode === 'create' 
        ? '/api/admin/news'
        : `/api/admin/news/${initialData.id}`
      
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        body: submitData,
        credentials: 'include',
      })

      let result: { error?: string } = {}
      try {
        result = await response.json()
      } catch {
        throw new Error(
          response.ok
            ? 'Invalid response from server'
            : `Save failed (${response.status}). Please try again.`,
        )
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save news article')
      }

      router.push('/admin/news')
      router.refresh()
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { value: 'conference', label: 'Conference Updates' },
    { value: 'speakers', label: 'Speaker Announcements' },
    { value: 'partnerships', label: 'Partnership News' },
    { value: 'youth-stories', label: 'Youth Stories' },
    { value: 'research', label: 'Research' },
    { value: 'advocacy', label: 'Advocacy' },
    { value: 'events', label: 'Events' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Article Information</h2>
        
        <div className="space-y-6">
          <FormField label="Article Title" required error={errors.title}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter article title"
            />
          </FormField>

          <FormField label="URL Slug" required error={errors.slug} hint="Auto-generated from title, but can be customized">
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              placeholder="article-url-slug"
            />
          </FormField>

          <FormField label="Excerpt" required error={errors.excerpt} hint={`${formData.excerpt.length}/200 characters (1-2 sentences)`}>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleInputChange('excerpt', e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Brief summary of the article..."
            />
          </FormField>

          <FormField label="Content" required error={errors.content}>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter article content..."
            />
          </FormField>
        </div>
      </div>

      {/* Featured Image */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <FormField label="Featured Image" required error={errors.featuredImage} hint="Recommended: 1200x630px for optimal display">
          <div className="space-y-4">
            {previewImage && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
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
              <span>{formData.featuredImage ? 'Change Image' : 'Upload Featured Image'}</span>
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

      {/* Categories & Tags */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Categories & Tags</h2>
        
        <div className="space-y-6">
          <FormField label="Categories" required error={errors.category} hint="Select at least one category">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <label key={cat.value} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.category.includes(cat.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('category', [...formData.category, cat.value])
                      } else {
                        handleInputChange('category', formData.category.filter(c => c !== cat.value))
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{cat.label}</span>
                </label>
              ))}
            </div>
          </FormField>

          <div>
            <div className="flex items-center justify-between mb-4">
              <FormField label="Tags" hint="Add relevant tags for better discoverability">
                <div />
              </FormField>
              <button
                type="button"
                onClick={addTag}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                Add Tag
              </button>
            </div>
            {errors.tags && (
              <p className="text-sm text-red-600 mb-2">{errors.tags}</p>
            )}
            <div className="space-y-3">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tag name"
                  />
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
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

      {/* Author & Publishing */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Author & Publishing</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Author" required error={errors.author}>
            <select
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select author</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email} {user.firstName ? `(${user.firstName} ${user.lastName})` : ''}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Publication Status" required>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>

          {formData.status === 'published' && (
            <FormField label="Published Date & Time" hint="Leave empty to use current date/time">
              <input
                type="datetime-local"
                value={formData.publishedDate || ''}
                onChange={(e) => handleInputChange('publishedDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </FormField>
          )}
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
            <div className="text-sm text-gray-500">Display this article prominently on the homepage</div>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {broadcastMessage && (
        <div
          className={`rounded-lg p-4 border flex items-start gap-3 ${
            broadcastMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {broadcastMessage.type === 'success' ? (
            <FiCheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{broadcastMessage.text}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-200">
        {mode === 'edit' ? (
          <button
            type="button"
            onClick={handleEmailSubscribers}
            disabled={broadcasting || loading || formData.status !== 'published'}
            title={
              formData.status !== 'published'
                ? 'Set status to Published to email subscribers'
                : 'Email all newsletter subscribers about this article'
            }
            className="flex items-center justify-center gap-2 px-6 py-2 border border-primary-600 text-primary-700 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {broadcasting ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <FiMail className="w-5 h-5" />
                Email subscribers
              </>
            )}
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || broadcasting}
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
                {mode === 'create' ? 'Create Article' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}



