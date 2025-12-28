'use client'

import { useState } from 'react'
import { FiSearch, FiCheckCircle, FiClock, FiXCircle, FiFileText, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiLoader } from 'react-icons/fi'
import { format } from 'date-fns'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending Review', color: 'yellow', icon: FiClock },
  confirmed: { label: 'Confirmed', color: 'green', icon: FiCheckCircle },
  cancelled: { label: 'Cancelled', color: 'red', icon: FiXCircle },
  received: { label: 'Received', color: 'blue', icon: FiFileText },
  'under-review': { label: 'Under Review', color: 'yellow', icon: FiClock },
  accepted: { label: 'Accepted', color: 'green', icon: FiCheckCircle },
  rejected: { label: 'Rejected', color: 'red', icon: FiXCircle },
  revisions: { label: 'Revisions Required', color: 'orange', icon: FiClock },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Payment Pending', color: 'yellow' },
  paid: { label: 'Paid', color: 'green' },
  waived: { label: 'Fee Waived', color: 'blue' },
  failed: { label: 'Payment Failed', color: 'red' },
}

export default function TrackPage() {
  const [registrationId, setRegistrationId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registration, setRegistration] = useState<any>(null)
  const [abstracts, setAbstracts] = useState<any[]>([])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registrationId.trim()) {
      setError('Please enter a Registration ID')
      return
    }

    setLoading(true)
    setError('')
    setRegistration(null)
    setAbstracts([])

    try {
      const response = await fetch(`/api/track?registrationId=${encodeURIComponent(registrationId.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch registration status')
      }

      if (data.registration) {
        setRegistration(data.registration)
      }
      if (data.abstracts) {
        setAbstracts(data.abstracts)
      }

      if (!data.registration && !data.abstracts?.length) {
        setError('No registration or abstract found with this ID. Please check your Registration ID or Abstract Submission ID and try again.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching your status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Track Your Application
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Enter your Registration ID or Abstract Submission ID to check your application status
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value.toUpperCase())}
                    placeholder="Enter Registration ID (e.g., SARSYC-261224-ABC123) or Abstract ID (e.g., ABS-2025-XFYT)"
                    className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-secondary px-8 py-4 text-lg font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    'Track Status'
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border border-red-300 rounded-lg text-left">
                  <p className="text-red-100">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {(registration || abstracts.length > 0) && (
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Registration Status */}
              {registration && (
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Registration Status</h2>
                    {(() => {
                      const status = statusConfig[registration.status] || statusConfig.pending
                      const Icon = status.icon
                      return (
                        <span className={`flex items-center gap-2 px-4 py-2 bg-${status.color}-100 text-${status.color}-700 rounded-full font-medium`}>
                          <Icon className="w-5 h-5" />
                          {status.label}
                        </span>
                      )
                    })()}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FiUser className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-semibold text-gray-900">
                            {registration.firstName} {registration.lastName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FiMail className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{registration.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FiPhone className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{registration.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <FiFileText className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Registration ID</p>
                          <p className="font-semibold text-gray-900 font-mono">{registration.registrationId}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FiCalendar className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="font-semibold text-gray-900">
                            {registration.createdAt ? format(new Date(registration.createdAt), 'PPP') : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FiMapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-semibold text-gray-900 capitalize">{registration.category || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  {registration.paymentStatus && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">Payment Status</p>
                        {(() => {
                          const paymentStatus = paymentStatusConfig[registration.paymentStatus] || paymentStatusConfig.pending
                          return (
                            <span className={`px-3 py-1 bg-${paymentStatus.color}-100 text-${paymentStatus.color}-700 rounded-full text-sm font-medium`}>
                              {paymentStatus.label}
                            </span>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {registration.organization && (
                    <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Organization</p>
                      <p className="font-semibold text-gray-900">{registration.organization}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Abstract Submissions */}
              {abstracts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Abstract Submissions</h2>
                  <div className="space-y-4">
                    {abstracts.map((abstract: any) => {
                      const status = statusConfig[abstract.status] || statusConfig.received
                      const Icon = status.icon
                      return (
                        <div key={abstract.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{abstract.title}</h3>
                              <p className="text-sm text-gray-600">
                                Submission ID: <span className="font-mono font-semibold">{abstract.submissionId || `ABS-${abstract.id}`}</span>
                              </p>
                            </div>
                            <span className={`flex items-center gap-2 px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium`}>
                              <Icon className="w-4 h-4" />
                              {status.label}
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-600">Track</p>
                              <p className="font-semibold text-gray-900 capitalize">{abstract.track || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Submitted</p>
                              <p className="font-semibold text-gray-900">
                                {abstract.submittedDate ? format(new Date(abstract.submittedDate), 'PPP') : 'N/A'}
                              </p>
                            </div>
                          </div>
                          {abstract.reviewerComments && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm font-semibold text-yellow-900 mb-1">Reviewer Comments:</p>
                              <p className="text-sm text-yellow-800">{abstract.reviewerComments}</p>
                            </div>
                          )}
                          {abstract.adminNotes && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm font-semibold text-blue-900 mb-1">Admin Notes:</p>
                              <p className="text-sm text-blue-800">{abstract.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {!registration && abstracts.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">No registration or abstract found with this ID.</p>
                  <p className="text-sm text-gray-500 mt-2">Please check your Registration ID and try again.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

