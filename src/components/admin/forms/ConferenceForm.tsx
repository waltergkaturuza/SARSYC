'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormField from './FormField'
import { FiSave, FiLoader, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi'
import { getConferenceMediaUrl } from '@/lib/conferenceMedia'

type OutcomeRow = { outcome: string }
type LinkRow = { label: string; url: string }
type GalleryRow = {
  key: string
  mediaId?: string
  url: string
  caption: string
}

interface ConferenceFormData {
  title: string
  slug: string
  year: string
  location: string
  theme: string
  summary: string
  participants: string
  highlights: string
  content: string
  startDate: string
  endDate: string
  isCurrent: boolean
  currentPath: string
  status: string
  keyOutcomes: OutcomeRow[]
  relatedLinks: LinkRow[]
  gallery: GalleryRow[]
}

interface ConferenceFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDateInput(value: unknown): string {
  if (!value) return ''
  const d = new Date(value as string)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function mapInitialGallery(initialData?: any): GalleryRow[] {
  if (!Array.isArray(initialData?.gallery)) return []
  return initialData.gallery
    .map((row: any, index: number) => {
      const url = getConferenceMediaUrl(row.image) || ''
      const mediaId =
        typeof row.image === 'object' && row.image?.id != null
          ? String(row.image.id)
          : row.image != null
            ? String(row.image)
            : undefined
      if (!url && !mediaId) return null
      return {
        key: row.id || `existing-${index}-${mediaId || url}`,
        mediaId,
        url,
        caption: row.caption || '',
      }
    })
    .filter(Boolean) as GalleryRow[]
}

export default function ConferenceForm({ initialData, mode }: ConferenceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ConferenceFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    year: initialData?.year != null ? String(initialData.year) : '',
    location: initialData?.location || '',
    theme: initialData?.theme || '',
    summary: initialData?.summary || '',
    participants: initialData?.participants || '',
    highlights: initialData?.highlights || '',
    content: initialData?.content || '',
    startDate: formatDateInput(initialData?.startDate),
    endDate: formatDateInput(initialData?.endDate),
    isCurrent: Boolean(initialData?.isCurrent),
    currentPath: initialData?.currentPath || '',
    status: initialData?.status || 'published',
    keyOutcomes: Array.isArray(initialData?.keyOutcomes)
      ? initialData.keyOutcomes.map((row: any) => ({ outcome: row.outcome || '' }))
      : [],
    relatedLinks: Array.isArray(initialData?.relatedLinks)
      ? initialData.relatedLinks.map((row: any) => ({
          label: row.label || '',
          url: row.url || '',
        }))
      : [],
    gallery: mapInitialGallery(initialData),
  })

  const handleChange = (field: keyof ConferenceFormData, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && mode === 'create' && !prev.slug) {
        next.slug = slugify(String(value))
      }
      return next
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setErrors((prev) => ({ ...prev, gallery: '' }))
    try {
      const uploaded: GalleryRow[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('conferenceSlug', formData.slug || formData.title || 'conference')
        const res = await fetch('/api/upload/conference-gallery', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        uploaded.push({
          key: `new-${Date.now()}-${file.name}`,
          mediaId: data.mediaId != null ? String(data.mediaId) : undefined,
          url: data.url as string,
          caption: '',
        })
      }
      setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ...uploaded] }))
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, gallery: err.message || 'Photo upload failed' }))
    } finally {
      setUploading(false)
    }
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!formData.title.trim()) next.title = 'Title is required'
    if (!formData.slug.trim()) next.slug = 'Slug is required'
    if (!formData.year.trim()) next.year = 'Year is required'
    if (!formData.location.trim()) next.location = 'Location is required'
    if (!formData.summary.trim()) next.summary = 'Summary is required'
    if (formData.gallery.length === 0) {
      next.gallery = 'Add at least one photo for this conference'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        year: Number(formData.year),
        location: formData.location.trim(),
        theme: formData.theme.trim() || null,
        summary: formData.summary.trim(),
        participants: formData.participants.trim() || null,
        highlights: formData.highlights.trim() || null,
        content: formData.content.trim() || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isCurrent: formData.isCurrent,
        currentPath: formData.isCurrent ? formData.currentPath.trim() || null : null,
        status: formData.status,
        keyOutcomes: formData.keyOutcomes
          .map((row) => ({ outcome: row.outcome.trim() }))
          .filter((row) => row.outcome),
        relatedLinks: formData.relatedLinks
          .map((row) => ({ label: row.label.trim(), url: row.url.trim() }))
          .filter((row) => row.label && row.url),
        gallery: formData.gallery.map((row) => ({
          mediaId: row.mediaId || undefined,
          url: row.url,
          caption: row.caption.trim() || null,
        })),
      }

      const url =
        mode === 'create' ? '/api/admin/conferences' : `/api/admin/conferences/${initialData.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to save conference')

      router.push('/admin/conferences')
      router.refresh()
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save conference' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Conference Details</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Title" required error={errors.title}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="SARSYC V"
            />
          </FormField>
          <FormField label="URL Slug" required error={errors.slug}>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="sarsyc-v"
            />
          </FormField>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FormField label="Year" required error={errors.year}>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="2024"
            />
          </FormField>
          <FormField label="Location" required error={errors.location}>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>
          <FormField label="Participants">
            <input
              type="text"
              value={formData.participants}
              onChange={(e) => handleChange('participants', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="500+"
            />
          </FormField>
        </div>

        <FormField label="Theme">
          <input
            type="text"
            value={formData.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </FormField>

        <FormField label="Summary" required error={errors.summary}>
          <textarea
            value={formData.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </FormField>

        <FormField label="Highlights">
          <input
            type="text"
            value={formData.highlights}
            onChange={(e) => handleChange('highlights', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </FormField>

        <FormField label="Full Description">
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Start Date">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </FormField>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Photo Gallery</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add at least one photo. Multiple photos will slide on the public conference pages.
            </p>
          </div>
          <label
            className={`inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700 transition-colors ${
              uploading ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            {uploading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiUpload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading…' : 'Upload photos'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void handleGalleryUpload(e.target.files)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        {errors.gallery && <p className="text-sm text-red-600">{errors.gallery}</p>}
        {formData.gallery.length === 0 ? (
          <p className="text-sm text-gray-500">No photos yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.gallery.map((row, index) => (
              <div key={row.key} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.url} alt="" className="h-40 w-full object-cover bg-gray-200" />
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    value={row.caption}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData((prev) => {
                        const gallery = [...prev.gallery]
                        gallery[index] = { ...gallery[index], caption: value }
                        return { ...prev, gallery }
                      })
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    placeholder="Caption (optional)"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        gallery: prev.gallery.filter((_, i) => i !== index),
                      }))
                    }
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Key Outcomes</h2>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                keyOutcomes: [...prev.keyOutcomes, { outcome: '' }],
              }))
            }
            className="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800"
          >
            <FiPlus className="w-4 h-4" />
            Add outcome
          </button>
        </div>
        {formData.keyOutcomes.length === 0 && (
          <p className="text-sm text-gray-500">No outcomes added yet.</p>
        )}
        <div className="space-y-3">
          {formData.keyOutcomes.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={row.outcome}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData((prev) => {
                    const keyOutcomes = [...prev.keyOutcomes]
                    keyOutcomes[index] = { outcome: value }
                    return { ...prev, keyOutcomes }
                  })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Outcome"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    keyOutcomes: prev.keyOutcomes.filter((_, i) => i !== index),
                  }))
                }
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Related Links</h2>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                relatedLinks: [...prev.relatedLinks, { label: '', url: '' }],
              }))
            }
            className="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800"
          >
            <FiPlus className="w-4 h-4" />
            Add link
          </button>
        </div>
        <div className="space-y-3">
          {formData.relatedLinks.map((row, index) => (
            <div key={index} className="grid md:grid-cols-[1fr_1.4fr_auto] gap-2">
              <input
                type="text"
                value={row.label}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData((prev) => {
                    const relatedLinks = [...prev.relatedLinks]
                    relatedLinks[index] = { ...relatedLinks[index], label: value }
                    return { ...prev, relatedLinks }
                  })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Label"
              />
              <input
                type="url"
                value={row.url}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData((prev) => {
                    const relatedLinks = [...prev.relatedLinks]
                    relatedLinks[index] = { ...relatedLinks[index], url: value }
                    return { ...prev, relatedLinks }
                  })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    relatedLinks: prev.relatedLinks.filter((_, i) => i !== index),
                  }))
                }
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Visibility</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Status">
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCurrent}
                onChange={(e) => handleChange('isCurrent', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">Current Conference</div>
                <div className="text-sm text-gray-500">
                  Marks this as current and moves the previous current edition into Previous
                  Conferences.
                </div>
              </div>
            </label>
            {formData.isCurrent && (
              <FormField label="Current Conference Path" hint="e.g. /sarsyc-vi">
                <input
                  type="text"
                  value={formData.currentPath}
                  onChange={(e) => handleChange('currentPath', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="/sarsyc-vi"
                />
              </FormField>
            )}
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              {mode === 'create' ? 'Create Conference' : 'Save Changes'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
