'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiSave, FiX, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'

// Create a dynamic schema based on mode
const createUserSchema = (isEditMode: boolean) => z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.enum(['admin', 'editor', 'contributor'], {
    required_error: 'Please select a role',
  }),
  organization: z.string().optional(),
  phone: z.string().optional(),
  password: isEditMode 
    ? z.string().optional()
    : z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: isEditMode 
    ? z.string().optional()
    : z.string().min(8, 'Please confirm your password'),
}).refine((data) => {
  // If password is provided, it must be at least 8 characters
  if (data.password && data.password.length > 0) {
    return data.password.length >= 8
  }
  return true
}, {
  message: 'Password must be at least 8 characters',
  path: ['password'],
}).refine((data) => {
  // If password is provided, confirmPassword must match
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword
  }
  return true
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

interface UserFormProps {
  initialData?: any
  mode: 'create' | 'edit'
}

export default function UserForm({ initialData, mode }: UserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isEditMode = mode === 'edit'
  const userSchema = createUserSchema(isEditMode)
  type UserFormData = z.infer<typeof userSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData || {
      role: 'editor',
    },
  })

  const password = watch('password')

  useEffect(() => {
    if (initialData) {
      setValue('email', initialData.email || '')
      setValue('firstName', initialData.firstName || '')
      setValue('lastName', initialData.lastName || '')
      setValue('role', initialData.role || 'editor')
      setValue('organization', initialData.organization || '')
      setValue('phone', initialData.phone || '')
    }
  }, [initialData, setValue])

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('firstName', data.firstName)
      formData.append('lastName', data.lastName)
      formData.append('role', data.role)
      if (data.organization) formData.append('organization', data.organization)
      if (data.phone) formData.append('phone', data.phone)
      if (data.password && data.password.length > 0) {
        formData.append('password', data.password)
      }

      const url = isEditMode 
        ? `/api/admin/users/${initialData.id}`
        : '/api/admin/users'
      
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save user')
      }

      // Success - redirect to users list
      router.push('/admin/users')
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <FiAlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                {...register('firstName')}
                type="text"
                id="firstName"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="John"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                {...register('lastName')}
                type="text"
                id="lastName"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                placeholder="Doe"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              disabled={isEditMode}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="john.doe@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
            {isEditMode && (
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed after user creation</p>
            )}
          </div>
        </div>

        {/* Role & Organization */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Role & Organization</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                {...register('role')}
                id="role"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white`}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="contributor">Contributor</option>
                <option value="reviewer">Reviewer</option>
                <option value="speaker">Speaker</option>
                <option value="presenter">Presenter</option>
                <option value="volunteer">Volunteer</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                <strong>Admin:</strong> Full access<br />
                <strong>Editor:</strong> Create and edit content<br />
                <strong>Contributor:</strong> Limited editing<br />
                <strong>Reviewer:</strong> Abstract evaluation only
              </p>
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <input
                {...register('organization')}
                type="text"
                id="organization"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Organization name"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+264 000 000 000"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isEditMode ? 'Change Password' : 'Set Password'}
          </h2>
          {isEditMode && (
            <p className="text-sm text-gray-600 mb-4">
              Leave blank to keep current password. Enter a new password to change it.
            </p>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {isEditMode ? 'New Password' : 'Password *'}
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder={isEditMode ? 'Leave blank to keep current' : 'Minimum 8 characters'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              {!isEditMode && (
                <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {isEditMode ? 'Confirm New Password' : 'Confirm Password *'}
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`w-full px-4 py-3 pr-10 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Link
            href="/admin/users"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <FiX className="w-5 h-5" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}

