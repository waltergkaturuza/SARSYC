'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiLoader, FiUpload, FiX } from 'react-icons/fi'
import { upload } from '@vercel/blob/client'
import { countries, getCountryLabel } from '@/lib/countries'

type OrathonCountryFormProps = {
  mode: 'create' | 'edit'
  initialData?: any
}

export default function OrathonCountryForm({ mode, initialData }: OrathonCountryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<string | null>(initialData?.flyer?.url || null)
  const [flyerFile, setFlyerFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    country: initialData?.country || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    registrationUrl: initialData?.registrationUrl || '',
    displayOrder: initialData?.displayOrder ?? 0,
    active: initialData?.active !== false,
  })

  const setField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const onCountryChange = (code: string) => {
    setField('country', code)
    if (!formData.title.trim() || formData.title.startsWith('Register for Orathon')) {
      setField('title', `Register for Orathon — ${getCountryLabel(code)}`)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, flyer: 'Flyer must be under 15MB' }))
      return
    }
    setFlyerFile(file)
    setPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, flyer: '' }))
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!formData.country) next.country = 'Country is required'
    if (!formData.title.trim()) next.title = 'Title is required'
    if (!formData.registrationUrl.trim()) next.registrationUrl = 'Registration link is required'
    else if (!/^https?:\/\//i.test(formData.registrationUrl.trim())) {
      next.registrationUrl = 'URL must start with http:// or https://'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      let flyerUrl: string | null = null
      if (flyerFile) {
        const safeName = flyerFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const blob = await upload(`orathon/flyers/${Date.now()}-${safeName}`, flyerFile, {
          access: 'public',
          handleUploadUrl: '/api/upload/orathon-flyer/presigned-url',
        })
        flyerUrl = blob.url
      }

      const payload = {
        ...formData,
        registrationUrl: formData.registrationUrl.trim(),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        ...(flyerUrl ? { flyerUrl } : {}),
      }

      const url =
        mode === 'create'
          ? '/api/admin/orathon-countries'
          : `/api/admin/orathon-countries/${initialData.id}`

      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      router.push('/admin/orathon-countries')
      router.refresh()
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
    >
      {errors.form && (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">{errors.form}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
        <select
          value={formData.country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select country</option>
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.country && <p className="text-sm text-red-600 mt-1">{errors.country}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setField('title', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Registration link *</label>
        <input
          type="url"
          value={formData.registrationUrl}
          onChange={(e) => setField('registrationUrl', e.target.value)}
          placeholder="https://"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        {errors.registrationUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.registrationUrl}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Flyer image</label>
        {preview && (
          <div className="relative mb-3 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Flyer preview"
              className="max-h-48 rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setFlyerFile(null)
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-gray-700 shadow"
              aria-label="Remove flyer preview"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700">
          <FiUpload className="w-4 h-4" />
          {preview ? 'Replace flyer' : 'Upload flyer'}
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </label>
        {errors.flyer && <p className="text-sm text-red-600 mt-1">{errors.flyer}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display order</label>
          <input
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setField('displayOrder', Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setField('active', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Active / published
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
          {mode === 'create' ? 'Add country' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/orathon-countries')}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
