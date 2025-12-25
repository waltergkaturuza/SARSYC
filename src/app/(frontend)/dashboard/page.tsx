'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiCheck, FiClock, FiFileText, FiCalendar, FiDownload, FiEdit, FiEye, FiAlertCircle } from 'react-icons/fi'

// Mock user data - will fetch from API/session
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  registrationStatus: 'confirmed',
  registrationId: 'REG-1234567890',
  abstractSubmissions: [
    {
      id: '1',
      title: 'Impact of CSE on Youth SRHR Knowledge in Botswana',
      submissionId: 'ABS-2026-ABC123',
      status: 'under-review',
      submittedDate: '2026-05-15',
      track: 'Youth Sexual & Reproductive Health',
    },
  ],
  bookmarkedSessions: [
    {
      id: '1',
      title: 'Opening Keynote',
      day: 'Day 1',
      time: '09:00 - 10:30',
      venue: 'Main Hall',
    },
  ],
}

const statusConfig: any = {
  'confirmed': { color: 'green', icon: FiCheck, label: 'Confirmed' },
  'pending': { color: 'yellow', icon: FiClock, label: 'Pending' },
  'under-review': { color: 'blue', icon: FiClock, label: 'Under Review' },
  'accepted': { color: 'green', icon: FiCheck, label: 'Accepted' },
  'rejected': { color: 'red', icon: FiAlertCircle, label: 'Not Accepted' },
  'revisions': { color: 'orange', icon: FiEdit, label: 'Revisions Requested' },
}

export default function DashboardPage() {
  const [user, setUser] = useState(userData)

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user.firstName}!
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
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Registration</h2>
                  {(() => {
                    const status = statusConfig[user.registrationStatus]
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
                      <p className="font-bold text-lg text-gray-900">{user.registrationId}</p>
                    </div>
                    <button className="btn-outline text-sm">
                      <FiDownload className="mr-2" />
                      Download
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="font-medium text-green-600">Confirmed ✓</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
                  <Link href="/participate/register?edit=true" className="btn-outline text-sm">
                    <FiEdit className="mr-2" />
                    Edit Registration
                  </Link>
                  <button className="btn-outline text-sm">
                    <FiDownload className="mr-2" />
                    Download QR Code
                  </button>
                </div>
              </div>

              {/* Abstract Submissions */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Abstracts</h2>
                  <Link href="/participate/submit-abstract" className="btn-primary text-sm">
                    Submit New Abstract
                  </Link>
                </div>

                {user.abstractSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {user.abstractSubmissions.map((abstract) => {
                      const status = statusConfig[abstract.status]
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

                          {abstract.status === 'under-review' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800">
                                <strong>Status:</strong> Your abstract is currently being reviewed by our committee. You'll receive a decision by June 30, 2026.
                              </p>
                            </div>
                          )}

                          {abstract.status === 'accepted' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-green-800">
                                <strong>Congratulations!</strong> Your abstract has been accepted for oral presentation. Session details will be emailed to you.
                              </p>
                            </div>
                          )}

                          <div className="flex gap-3 mt-4">
                            <button className="btn-outline text-sm">
                              <FiEye className="mr-2" />
                              View Details
                            </button>
                            {abstract.status === 'revisions' && (
                              <button className="btn-primary text-sm">
                                <FiEdit className="mr-2" />
                                Resubmit
                              </button>
                            )}
                          </div>
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

              {/* Bookmarked Sessions */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Schedule</h2>
                
                {user.bookmarkedSessions.length > 0 ? (
                  <div className="space-y-4">
                    {user.bookmarkedSessions.map((session) => (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-gray-900 mb-2">{session.title}</h4>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>{session.day}</span>
                          <span>{session.time}</span>
                          <span>{session.venue}</span>
                        </div>
                      </div>
                    ))}
                    <Link href="/programme" className="btn-outline w-full justify-center">
                      View Full Programme
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No sessions bookmarked yet.</p>
                    <Link href="/programme" className="btn-primary">
                      Explore Programme
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

