'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiUser, FiAlertCircle, FiArrowRight, FiChevronDown } from 'react-icons/fi'
import {
  LOGIN_PORTAL_TYPES,
  loginApiType,
  loginNotice,
  parseLoginPortalType,
  redirectAfterLogin,
  usesDirectLogin,
  type LoginPortalType,
} from '@/lib/loginUserTypes'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<LoginPortalType>(() =>
    parseLoginPortalType(searchParams.get('type')),
  )

  useEffect(() => {
    setUserType(parseLoginPortalType(searchParams.get('type')))
  }, [searchParams])

  const notice = useMemo(() => loginNotice(userType), [userType])
  const selectedMeta = useMemo(
    () => LOGIN_PORTAL_TYPES.find((t) => t.value === userType),
    [userType],
  )

  const groups = useMemo(() => {
    type PortalEntry = (typeof LOGIN_PORTAL_TYPES)[number]
    const map = new Map<string, PortalEntry[]>()
    for (const t of LOGIN_PORTAL_TYPES) {
      const list = map.get(t.group)
      if (list) list.push(t)
      else map.set(t.group, [t])
    }
    return Array.from(map.entries())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiType = loginApiType(userType)
      const loginUrl = usesDirectLogin(userType) ? '/api/auth/direct-login' : '/api/auth/login'
      const loginBody = usesDirectLogin(userType)
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, type: apiType }

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.token) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_type', userType)
      }

      await new Promise((resolve) => setTimeout(resolve, 100))

      const dest = redirectAfterLogin(userType)
      if (dest.startsWith('/admin')) {
        window.location.href = dest
      } else {
        router.push(dest)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-8 md:py-10">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Login to Your Account</h1>
            <p className="text-white/90 text-sm md:text-base">
              Access your dashboard, submissions, and conference tools
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="card p-6 md:p-8 shadow-xl">
              <div className="mb-5">
                <label htmlFor="userType" className="block text-sm font-bold text-gray-800 mb-2">
                  I am signing in as
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <select
                    id="userType"
                    value={userType}
                    onChange={(e) => setUserType(parseLoginPortalType(e.target.value))}
                    className="w-full appearance-none pl-10 pr-10 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {groups.map(([group, items]) => (
                      <optgroup key={group} label={group}>
                        {items.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
                {selectedMeta ? (
                  <p className="mt-2 text-xs text-gray-500">{selectedMeta.description}</p>
                ) : null}
              </div>

              {notice ? (
                <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                  {notice}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                ) : null}

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 font-medium text-gray-700">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Login'}
                  {!loading ? <FiArrowRight className="ml-2 w-4 h-4" /> : null}
                </button>
              </form>

              <p className="mt-6 pt-5 border-t border-gray-200 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/participate/register"
                  className="text-primary-600 font-bold hover:underline"
                >
                  Register for SARSYC VI
                </Link>
              </p>

              {(userType === 'admin' || userType === 'editor' || userType === 'accountant') && (
                <p className="mt-3 text-center">
                  <Link href="/admin" className="text-xs text-gray-500 hover:text-primary-600">
                    Go to admin panel →
                  </Link>
                </p>
              )}
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Need help?{' '}
              <Link href="/contact" className="text-primary-600 font-semibold hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="py-10 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto card p-8 text-center text-gray-600">Loading login…</div>
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
