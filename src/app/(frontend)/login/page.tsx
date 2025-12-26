'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiUser, FiAlertCircle, FiArrowRight } from 'react-icons/fi'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'participant' | 'speaker' | 'admin'>('participant')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Handle different login types
      if (userType === 'admin') {
        // Redirect to Payload admin panel (Payload handles its own login)
        window.location.href = '/admin'
        return
      }

      // For participants and speakers, authenticate via API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          type: userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token and redirect
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_type', userType)
      }

      // Redirect based on user type
      if (userType === 'participant') {
        router.push('/dashboard')
      } else if (userType === 'speaker') {
        router.push('/dashboard?type=speaker')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Login to Your Account</h1>
            <p className="text-white/90">Access your dashboard, manage your profile, and track your submissions</p>
          </div>
        </div>
      </section>

      {/* Login Form */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="max-w-md mx-auto">
            <div className="card p-8">
              {/* User Type Selector */}
              <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUserType('participant')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    userType === 'participant'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiUser className="inline mr-2" />
                  Participant
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('speaker')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    userType === 'speaker'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiUser className="inline mr-2" />
                  Speaker
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('admin')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    userType === 'admin'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Admin
                </button>
              </div>

              {userType === 'admin' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Admin Login:</strong> Clicking "Login" will redirect you to the Payload CMS admin panel.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Login'}
                  {!loading && <FiArrowRight className="ml-2" />}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/participate/register" className="text-primary-600 font-medium hover:underline">
                    Register for SARSYC VI
                  </Link>
                </p>
              </div>

              {userType === 'admin' && (
                <div className="mt-6 text-center">
                  <Link href="/admin" className="text-sm text-gray-600 hover:text-primary-600">
                    Go to Admin Panel →
                  </Link>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-4">Need help?</p>
              <Link href="/contact" className="text-primary-600 font-medium hover:underline text-sm">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

