'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiCheck, FiClock, FiFileText, FiCalendar, FiDownload, FiEdit, FiEye, FiAlertCircle, FiLoader } from 'react-icons/fi'

const statusConfig: any = {
  'confirmed': { color: 'green', icon: FiCheck, label: 'Confirmed' },
  'pending': { color: 'yellow', icon: FiClock, label: 'Pending' },
  'under-review': { color: 'blue', icon: FiClock, label: 'Under Review' },
  'received': { color: 'blue', icon: FiClock, label: 'Received' },
  'accepted': { color: 'green', icon: FiCheck, label: 'Accepted' },
  'rejected': { color: 'red', icon: FiAlertCircle, label: 'Not Accepted' },
  'revisions': { color: 'orange', icon: FiEdit, label: 'Revisions Requested' },
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [registration, setRegistration] = useState<any>(null)
  const [abstractSubmissions, setAbstractSubmissions] = useState<any[]>([])

  useEffect(() => {
    // Get email from localStorage or URL params (in a real app, use auth/session)
    const email = new URLSearchParams(window.location.search).get('email') || localStorage.getItem('userEmail')
    
    if (email) {
      fetchDashboardData(email)
    } else {
      // Show message to enter email or login
      setLoading(false)
    }
  }, [])

  const fetchDashboardData = async (email: string) => {
    setLoading(true)
    try {
      // Fetch registration data
      const dashboardResponse = await fetch(`/api/user/dashboard?email=${encodeURIComponent(email)}`)
      const dashboardData = await dashboardResponse.json()
      
      if (dashboardResponse.ok) {
        setRegistration(dashboardData.registration)
      }

      // Fetch detailed abstract data with reviewer comments
      const abstractsResponse = await fetch(`/api/abstracts/track?email=${encodeURIComponent(email)}`)
      const abstractsData = await abstractsResponse.json()
      
      if (abstractsResponse.ok && abstractsData.success) {
        setAbstractSubmissions(abstractsData.abstracts || [])
      } else {
        // Fallback to basic data if detailed fetch fails
        setAbstractSubmissions(dashboardData.abstractSubmissions || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back{registration?.firstName ? `, ${registration.firstName}` : ''}!
          </h1>
          <p className="text-white/90">
            Manage your SARSYC VI registration and submissions
          </p>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Registration Status */}
              {registration ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Registration</h2>
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

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Registration ID</p>
                        <p className="font-bold text-lg text-gray-900">{registration.registrationId}</p>
                      </div>
                      <button className="btn-outline text-sm">
                        <FiDownload className="mr-2" />
                        Download
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium text-gray-900">{registration.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="font-medium text-green-600">
                          {registration.status === 'confirmed' ? 'Confirmed ✓' : registration.status}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Category</p>
                        <p className="font-medium text-gray-900">{registration.category}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Country</p>
                        <p className="font-medium text-gray-900">{registration.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <p className="text-gray-600 mb-4">You haven't registered yet.</p>
                  <Link href="/participate/register" className="btn-primary">
                    Register Now
                  </Link>
                </div>
              )}

              {/* Abstract Submissions */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Abstracts</h2>
                  <Link href="/participate/submit-abstract" className="btn-primary text-sm">
                    Submit New Abstract
                  </Link>
                </div>

                {abstractSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {abstractSubmissions.map((abstract) => {
                      const status = statusConfig[abstract.status] || statusConfig.received
                      const Icon = status.icon
                      
                      return (
                        <div key={abstract.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-2">{abstract.title}</h3>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <FiFileText className="w-4 h-4" />
                                  {abstract.submissionId}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="w-4 h-4" />
                                  Submitted: {new Date(abstract.submittedDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <span className={`flex items-center gap-2 px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium whitespace-nowrap`}>
                              <Icon className="w-4 h-4" />
                              {status.label}
                            </span>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg mb-4">
                            <p className="text-sm text-gray-600">Track: <span className="font-medium text-gray-900">{abstract.track}</span></p>
                          </div>

                          {/* Status Messages with Feedback */}
                          {(abstract.status === 'received' || abstract.status === 'under-review') && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                              <p className="text-sm text-blue-800">
                                <strong>Status:</strong> Your abstract is currently being reviewed by our committee. We will notify you once a decision has been made.
                              </p>
                            </div>
                          )}

                          {abstract.status === 'accepted' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                              <div className="flex items-start gap-2">
                                <FiCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-green-900 mb-1">
                                    Congratulations! Your abstract has been accepted.
                                  </p>
                                  {abstract.reviewerComments && (
                                    <div className="mt-2 pt-2 border-t border-green-200">
                                      <p className="text-xs font-medium text-green-800 mb-1">Feedback from Reviewers:</p>
                                      <p className="text-sm text-green-700 whitespace-pre-wrap">{abstract.reviewerComments}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {abstract.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                              <div className="flex items-start gap-2">
                                <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-red-900 mb-1">
                                    Your abstract was not accepted for this conference.
                                  </p>
                                  {abstract.reviewerComments ? (
                                    <div className="mt-2 pt-2 border-t border-red-200">
                                      <p className="text-xs font-medium text-red-800 mb-1">Feedback from Reviewers:</p>
                                      <p className="text-sm text-red-700 whitespace-pre-wrap">{abstract.reviewerComments}</p>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-red-700 mt-2">
                                      We appreciate your submission and encourage you to submit again in the future.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {abstract.status === 'revisions' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                              <div className="flex items-start gap-2">
                                <FiEdit className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-orange-900 mb-1">
                                    Revisions Requested
                                  </p>
                                  {abstract.reviewerComments ? (
                                    <div className="mt-2 pt-2 border-t border-orange-200">
                                      <p className="text-xs font-medium text-orange-800 mb-1">Reviewer Feedback:</p>
                                      <p className="text-sm text-orange-700 whitespace-pre-wrap">{abstract.reviewerComments}</p>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-orange-700 mt-2">
                                      Please review the feedback and submit a revised version of your abstract.
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiFileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">You haven't submitted any abstracts yet.</p>
                    <Link href="/participate/submit-abstract" className="btn-primary">
                      Submit Your First Abstract
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/participate/submit-abstract" className="btn-primary w-full justify-center text-sm">
                    Submit Abstract
                  </Link>
                  <Link href="/programme" className="btn-outline w-full justify-center text-sm">
                    View Programme
                  </Link>
                  <Link href="/contact" className="btn-outline w-full justify-center text-sm">
                    Contact Support
                  </Link>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-4">Important Dates</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-white/80">Abstract Deadline</p>
                    <p className="font-bold">June 30, 2026</p>
                  </div>
                  <div>
                    <p className="text-white/80">Conference Dates</p>
                    <p className="font-bold">August 5-7, 2026</p>
                  </div>
                </div>
              </div>

              {/* Help */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your registration or abstract?
                </p>
                <Link href="/contact" className="text-primary-600 font-medium text-sm hover:underline">
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
