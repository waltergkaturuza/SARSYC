'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { showToast } from '@/lib/toast'
import { FiSave, FiX, FiLoader } from 'react-icons/fi'

const sponsorshipTierSchema = z.object({
  name: z.string().min(2, 'Tier name is required'),
  price: z.string().min(1, 'Price is required'),
  order: z.number().int().min(0, 'Order must be 0 or greater'),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  icon: z.enum(['star', 'award', 'trending', 'heart', 'diamond', 'trophy']),
  color: z.enum(['gray', 'yellow', 'silver', 'orange', 'blue', 'purple', 'green', 'red']),
  benefits: z.array(z.object({ benefit: z.string().min(1, 'Benefit text is required') })).min(1, 'At least one benefit is required'),
  description: z.string().optional(),
})

type SponsorshipTierFormData = z.infer<typeof sponsorshipTierSchema>

interface SponsorshipTierFormProps {
  mode: 'create' | 'edit'
  initialData?: any
}

export default function SponsorshipTierForm({ mode, initialData }: SponsorshipTierFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [benefits, setBenefits] = useState<Array<{ benefit: string }>>(
    initialData?.benefits || [{ benefit: '' }]
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SponsorshipTierFormData>({
    resolver: zodResolver(sponsorshipTierSchema),
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || '',
      order: initialData?.order ?? 0,
      isActive: initialData?.isActive ?? true,
      isPopular: initialData?.isPopular ?? false,
      icon: initialData?.icon || 'star',
      color: initialData?.color || 'gray',
      description: initialData?.description || '',
      benefits: initialData?.benefits || [{ benefit: '' }],
    },
  })

  const isActive = watch('isActive')
  const isPopular = watch('isPopular')

  useEffect(() => {
    setValue('benefits', benefits)
  }, [benefits, setValue])

  const addBenefit = () => {
    setBenefits([...benefits, { benefit: '' }])
  }

  const removeBenefit = (index: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== index))
    }
  }

  const updateBenefit = (index: number, value: string) => {
    const updated = [...benefits]
    updated[index] = { benefit: value }
    setBenefits(updated)
  }

  const onSubmit = async (data: SponsorshipTierFormData) => {
    setIsSubmitting(true)

    try {
      const url = mode === 'create' 
        ? '/api/admin/sponsorship-tiers'
        : `/api/admin/sponsorship-tiers/${initialData.id}`
      
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save sponsorship tier')
      }

      showToast.success(
        mode === 'create' 
          ? 'Sponsorship tier created successfully!'
          : 'Sponsorship tier updated successfully!'
      )
      
      router.push('/admin/sponsorship-tiers')
      router.refresh()
    } catch (error: any) {
      showToast.error(error.message || 'Failed to save sponsorship tier')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tier Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="e.g., Platinum, Gold, Silver"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              {...register('price')}
              type="text"
              id="price"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              placeholder="e.g., $25,000 or Custom"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Display Order *
            </label>
            <input
              {...register('order', { valueAsNumber: true })}
              type="number"
              id="order"
              min="0"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.order ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
            {errors.order && (
              <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
              Icon *
            </label>
            <select
              {...register('icon')}
              id="icon"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.icon ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              <option value="star">Star</option>
              <option value="award">Award</option>
              <option value="trending">Trending Up</option>
              <option value="heart">Heart</option>
              <option value="diamond">Diamond</option>
              <option value="trophy">Trophy</option>
            </select>
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme *
            </label>
            <select
              {...register('color')}
              id="color"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.color ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              <option value="gray">Gray</option>
              <option value="yellow">Yellow/Gold</option>
              <option value="silver">Silver</option>
              <option value="orange">Orange</option>
              <option value="blue">Blue</option>
              <option value="purple">Purple</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Optional description or additional information"
          />
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Benefits * (At least one required)
          </label>
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={benefit.benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={`Benefit ${index + 1}`}
              />
              {benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          {errors.benefits && (
            <p className="mt-1 text-sm text-red-600">{errors.benefits.message}</p>
          )}
          <button
            type="button"
            onClick={addBenefit}
            className="mt-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg border border-primary-200 text-sm font-medium"
          >
            + Add Benefit
          </button>
        </div>

        {/* Status Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('isActive')}
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('isPopular')}
              type="checkbox"
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Mark as "Most Popular"</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                {mode === 'create' ? 'Create Tier' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}


