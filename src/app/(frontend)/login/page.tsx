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
      // Authenticate ALL users via API (including admin)
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

      // Verify authentication was successful
      if (!data.success || !data.token) {
        throw new Error('Authentication failed')
      }

      // Store token and user info
      if (data.token) {
        // Store in localStorage for API calls
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_type', userType)
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user))
        }
        
        // Set cookie for server-side authentication (Payload expects 'payload-token')
        // Use secure cookie settings for production
        const isProduction = window.location.hostname !== 'localhost'
        const cookieOptions = [
          `payload-token=${data.token}`,
          'path=/',
          `max-age=${7 * 24 * 60 * 60}`, // 7 days
          'SameSite=Lax',
          ...(isProduction ? ['Secure'] : []), // Secure flag for HTTPS
        ].join('; ')
        
        document.cookie = cookieOptions
        
        // Verify cookie was set
        const cookieSet = document.cookie.includes('payload-token')
        if (!cookieSet) {
          console.warn('Cookie may not have been set properly')
        }
      }

      // Small delay to ensure cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 100))

      // Redirect based on user type
      if (userType === 'admin') {
        // Use window.location.href for full page reload to ensure cookie is sent
        window.location.href = '/admin'
      } else if (userType === 'participant') {
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
          <div className="max-w-lg mx-auto">
            <div className="card p-10 md:p-12 shadow-2xl">
              {/* User Type Selector */}
              <div className="flex gap-3 mb-10 p-1.5 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUserType('participant')}
                  className={`flex-1 py-3 px-5 rounded-lg text-base font-bold transition-all duration-200 ${
                    userType === 'participant'
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                  }`}
                >
                  <FiUser className="inline mr-2 w-5 h-5" />
                  Participant
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('speaker')}
                  className={`flex-1 py-3 px-5 rounded-lg text-base font-bold transition-all duration-200 ${
                    userType === 'speaker'
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                  }`}
                >
                  <FiUser className="inline mr-2 w-5 h-5" />
                  Speaker
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('admin')}
                  className={`flex-1 py-3 px-5 rounded-lg text-base font-bold transition-all duration-200 ${
                    userType === 'admin'
                      ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-gray-200 hover:scale-[1.02]'
                  }`}
                >
                  Admin
                </button>
              </div>

              {userType === 'admin' && (
                <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-primary-50 border-2 border-primary-200 rounded-xl shadow-sm">
                  <p className="text-base text-blue-900 font-semibold">
                    <strong>Admin Login:</strong> Clicking "Login" will redirect you to the Payload CMS admin panel.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-base font-bold text-gray-800 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-base font-medium"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-base font-bold text-gray-800 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-base font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer" />
                    <span className="ml-3 text-base font-semibold text-gray-700">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-base font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center text-lg font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                >
                  {loading ? 'Logging in...' : 'Login'}
                  {!loading && <FiArrowRight className="ml-2 w-5 h-5" />}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t-2 border-gray-200">
                <p className="text-center text-base text-gray-700 font-semibold">
                  Don't have an account?{' '}
                  <Link href="/participate/register" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors">
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
            <div className="mt-10 text-center">
              <p className="text-base text-gray-700 font-semibold mb-4">Need help?</p>
              <Link href="/contact" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-colors text-base">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

