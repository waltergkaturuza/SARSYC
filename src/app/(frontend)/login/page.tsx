'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiUser, FiAlertCircle, FiArrowRight } from 'react-icons/fi'
import { showToast } from '@/lib/toast'

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
      console.log('[Login] Starting login attempt...')
      console.log('[Login] Email:', formData.email)
      console.log('[Login] User Type:', userType)
      
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

      console.log('[Login] Response status:', response.status, response.statusText)
      
      let data
      try {
        data = await response.json()
        console.log('[Login] Response data:', { 
          success: data.success, 
          hasToken: !!data.token, 
          error: data.error,
          user: data.user ? { email: data.user.email, role: data.user.role } : null
        })
      } catch (parseError) {
        console.error('[Login] Failed to parse JSON response:', parseError)
        const text = await response.text()
        console.error('[Login] Response text:', text)
        throw new Error('Invalid response from server')
      }

      if (!response.ok) {
        const errorMsg = data.error || `Login failed (${response.status})`
        showToast.error(errorMsg)
        throw new Error(errorMsg)
      }

      // Verify authentication was successful
      if (!data.success || !data.token) {
        showToast.error('Authentication failed - invalid response')
        throw new Error('Authentication failed - invalid response')
      }
      
      showToast.success('Login successful!')

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
      
      // For admin, ensure cookie is set and redirect
      if (userType === 'admin') {
        // Set cookie client-side (this is the most reliable method)
        // The server-side cookie from the API response should also be set, but we set it client-side as backup
        const isProduction = window.location.hostname !== 'localhost'
        const cookieString = `payload-token=${encodeURIComponent(data.token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${isProduction ? '; Secure' : ''}`
        document.cookie = cookieString
        
        // Log for debugging
        console.log('[Admin Login] Login successful!')
        console.log('[Admin Login] Token received:', !!data.token)
        console.log('[Admin Login] Cookie set:', cookieString.substring(0, 50) + '...')
        console.log('[Admin Login] All cookies:', document.cookie)
        
        // Use redirect URL if provided, otherwise default to /admin
        const targetUrl = redirectUrl || '/admin'
        
        console.log('[Admin Login] About to redirect to:', targetUrl)
        
        // Small delay to ensure cookie is processed
        await new Promise(resolve => setTimeout(resolve, 50))
        
        // ALWAYS redirect - don't block on cookie check
        // The cookie is set, and if there's an issue, the middleware will handle it
        console.log('[Admin Login] Executing redirect now...')
        window.location.href = targetUrl
        
        // Prevent any further execution
        return
      } else {
        // For all other user types (speaker, presenter, contributor, etc.)
        // Redirect to dashboard
        router.push(redirectUrl || '/dashboard')
      }
    } catch (err: any) {
      console.error('[Login] Error caught:', err)
      const errorMessage = err.message || 'An error occurred. Please try again.'
      console.error('[Login] Setting error message:', errorMessage)
      setError(errorMessage)
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
