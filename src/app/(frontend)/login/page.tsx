'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiUser, FiAlertCircle, FiArrowRight } from 'react-icons/fi'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Get user type from URL params or default to participant
  const urlType = searchParams.get('type') as 'participant' | 'speaker' | 'admin' | null
  const [userType, setUserType] = useState<'participant' | 'speaker' | 'admin'>(
    urlType || 'participant'
  )
  
  // Update user type when URL param changes
  useEffect(() => {
    if (urlType && ['participant', 'speaker', 'admin'].includes(urlType)) {
      setUserType(urlType)
    }
  }, [urlType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Authenticate ALL users via API (including admin)
      // IMPORTANT: Use credentials: 'include' to ensure cookies are sent and received
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in request and response
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

      // Store token and user info in localStorage for client-side use
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_type', userType)
        if (data.user) {
          localStorage.setItem('user_data', JSON.stringify(data.user))
        }
      }

      // Get redirect URL from query params or use default
      const redirectUrl = searchParams.get('redirect')
      
      // For admin, the cookie is set server-side in the API response
      // The browser automatically processes Set-Cookie headers from the fetch response
      if (userType === 'admin') {
        // IMPORTANT: Cookies set via response.cookies.set() in the API are automatically
        // included in document.cookie by the browser after the fetch completes.
        // However, we need to ensure the response is fully processed.
        
        // Wait for next tick to ensure browser has processed the Set-Cookie header
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Also set cookie client-side as backup (in case server-side cookie didn't work)
        const isProduction = window.location.hostname !== 'localhost'
        const cookieString = `payload-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? '; Secure' : ''}`
        document.cookie = cookieString
        
        // Wait a bit more to ensure both cookies are set
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Verify the cookie is available
        const cookieCheck = document.cookie.includes('payload-token')
        console.log('[Admin Login] Cookie check before redirect:', cookieCheck)
        console.log('[Admin Login] All cookies:', document.cookie)
        console.log('[Admin Login] Token received:', !!data.token)
        console.log('[Admin Login] Token length:', data.token?.length)
        
        if (!cookieCheck) {
          console.error('[Admin Login] WARNING: Cookie not found! This will cause redirect loop.')
          setError('Failed to set authentication cookie. Please try again.')
          setLoading(false)
          return
        }
        
        // Use redirect URL if provided, otherwise default to /admin
        const targetUrl = redirectUrl || '/admin'
        
        console.log('[Admin Login] Redirecting to:', targetUrl)
        
        // Use window.location.href for full page reload
        // This ensures cookies are included in the request
        window.location.href = targetUrl
        return // Exit early to prevent further execution
      } else if (userType === 'participant') {
        router.push(redirectUrl || '/dashboard')
      } else if (userType === 'speaker') {
        router.push(redirectUrl || '/dashboard?type=speaker')
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

