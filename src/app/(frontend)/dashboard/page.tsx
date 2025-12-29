import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import Link from 'next/link'
import { 
  FiCheck, FiClock, FiFileText, FiCalendar, FiDownload, FiEdit, FiEye, 
  FiAlertCircle, FiLoader, FiUser, FiMail, FiLock, FiSettings, FiMic,
  FiMapPin, FiClock as FiTime, FiShield, FiBriefcase
} from 'react-icons/fi'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const revalidate = 0

const statusConfig: any = {
  'confirmed': { color: 'green', icon: FiCheck, label: 'Confirmed' },
  'pending': { color: 'yellow', icon: FiClock, label: 'Pending' },
  'under-review': { color: 'blue', icon: FiClock, label: 'Under Review' },
  'received': { color: 'blue', icon: FiClock, label: 'Received' },
  'accepted': { color: 'green', icon: FiCheck, label: 'Accepted' },
  'rejected': { color: 'red', icon: FiAlertCircle, label: 'Not Accepted' },
  'revisions': { color: 'orange', icon: FiEdit, label: 'Revisions Requested' },
}

export default async function DashboardPage() {
  // Get authenticated user
  const currentUser = await getCurrentUserFromCookies()
  
  if (!currentUser) {
    redirect('/login?redirect=/dashboard')
  }

  const payload = await getPayloadClient()
  const userEmail = currentUser.email

  // Fetch all user-specific data
  const [registrations, abstracts, speaker, sessions] = await Promise.all([
    // Get user's registration
    payload.find({
      collection: 'registrations',
      where: {
        email: { equals: userEmail },
      },
      limit: 1,
      sort: '-createdAt',
      overrideAccess: true,
    }),
    // Get user's abstracts (for presenters)
    payload.find({
      collection: 'abstracts',
      where: {
        'primaryAuthor.email': { equals: userEmail },
      },
      sort: '-createdAt',
      overrideAccess: true,
    }),
    // Get speaker profile (for speakers)
    currentUser.role === 'speaker' && currentUser.speaker
      ? payload.findByID({
          collection: 'speakers',
          id: typeof currentUser.speaker === 'string' 
            ? currentUser.speaker 
            : (currentUser.speaker as any).id || currentUser.speaker,
          depth: 2,
          overrideAccess: true,
        }).catch(() => null)
      : Promise.resolve(null),
    // Get sessions for speaker
    currentUser.role === 'speaker' && currentUser.speaker
      ? (async () => {
          try {
            const speakerData = await payload.findByID({
              collection: 'speakers',
              id: typeof currentUser.speaker === 'string' 
                ? currentUser.speaker 
                : (currentUser.speaker as any).id || currentUser.speaker,
              depth: 2,
              overrideAccess: true,
            })
            
            if (speakerData.sessions && Array.isArray(speakerData.sessions)) {
              return speakerData.sessions.map((s: any) => {
                const session = typeof s === 'object' ? s : null
                return session ? {
                  id: session.id,
                  title: session.title,
                  date: session.date,
                  startTime: session.startTime,
                  endTime: session.endTime,
                  venue: session.venue,
                  type: session.type,
                  description: session.description,
                } : null
              }).filter(Boolean)
            }
            return []
          } catch {
            return []
          }
        })()
      : Promise.resolve([]),
  ])

  const registration = registrations.docs.length > 0 ? registrations.docs[0] : null
  const abstractSubmissions = abstracts.docs.map((abstract: any) => ({
    id: abstract.id.toString(),
    title: abstract.title,
    submissionId: abstract.submissionId || `ABS-${abstract.id}`,
    status: abstract.status || 'received',
    submittedDate: abstract.createdAt,
    track: abstract.track,
    reviewerComments: abstract.reviewerComments || null,
    assignedSession: abstract.assignedSession || null,
  }))

  const speakerData = speaker ? {
    id: speaker.id,
    name: speaker.name,
    title: speaker.title,
    organization: speaker.organization,
    photo: speaker.photo,
    bio: speaker.bio,
    type: speaker.type,
    featured: speaker.featured,
  } : null

  // Determine role-specific content
  const roleConfig: Record<string, { 
    title: string
    description: string
    icon: any
    color: string
  }> = {
    'speaker': {
      title: 'Speaker Dashboard',
      description: 'Manage your speaker profile, sessions, and conference materials',
      icon: FiMic,
      color: 'purple',
    },
    'presenter': {
      title: 'Presenter Dashboard',
      description: 'Track your abstract submissions and presentation schedule',
      icon: FiFileText,
      color: 'indigo',
    },
    'contributor': {
      title: 'Contributor Dashboard',
      description: 'Manage your contributions and submissions',
      icon: FiUser,
      color: 'blue',
    },
    'editor': {
      title: 'Editor Dashboard',
      description: 'Manage content and submissions',
      icon: FiEdit,
      color: 'green',
    },
    'admin': {
      title: 'Admin Dashboard',
      description: 'Full system access and management',
      icon: FiShield,
      color: 'red',
    },
  }

  const roleInfo = roleConfig[currentUser.role as string] || roleConfig['contributor']
  const RoleIcon = roleInfo.icon

  return (
    <>
      {/* Header */}
      <section className={`bg-gradient-to-br ${
        roleInfo.color === 'purple' ? 'from-purple-600 to-indigo-600' :
        roleInfo.color === 'indigo' ? 'from-indigo-600 to-purple-600' :
        roleInfo.color === 'red' ? 'from-red-600 to-pink-600' :
        roleInfo.color === 'green' ? 'from-green-600 to-emerald-600' :
        'from-blue-600 to-cyan-600'
      } text-white py-12`}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <RoleIcon className="w-8 h-8" />
                <h1 className="text-3xl md:text-4xl font-bold">
                  Welcome back, {currentUser.firstName}!
                </h1>
              </div>
              <p className="text-white/90 text-lg">
                {roleInfo.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/forgot-password"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <FiLock className="w-4 h-4" />
                Reset Password
              </Link>
              <Link
                href="/login?action=logout"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-bold text-gray-900">{currentUser.firstName} {currentUser.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiMail className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-bold text-gray-900">{currentUser.email}</p>
                    </div>
                  </div>
                  {currentUser.organization && (
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiBriefcase className="w-8 h-8 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Organization</p>
                        <p className="font-bold text-gray-900">{currentUser.organization}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiShield className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <p className="font-bold text-gray-900 capitalize">{currentUser.role}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <FiLock className="w-4 h-4" />
                    Change Password
                  </Link>
                </div>
              </div>

              {/* Registration Status - Show for all users */}
              {registration ? (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Registration</h2>
                    {(() => {
                      const status = statusConfig[registration.status] || statusConfig.pending
                      const Icon = status.icon
                      const colorClasses: Record<string, string> = {
                        green: 'bg-green-100 text-green-700',
                        yellow: 'bg-yellow-100 text-yellow-700',
                        blue: 'bg-blue-100 text-blue-700',
                        red: 'bg-red-100 text-red-700',
                        orange: 'bg-orange-100 text-orange-700',
                      }
                      return (
                        <span className={`flex items-center gap-2 px-4 py-2 ${colorClasses[status.color] || colorClasses.blue} rounded-full font-medium`}>
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
                        <p className="font-bold text-lg text-gray-900">{registration.registrationId || `REG-${registration.id}`}</p>
                      </div>
                      <Link href={`/track?id=${registration.registrationId || registration.id}`} className="btn-outline text-sm">
                        <FiEye className="mr-2" />
                        View Details
                      </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Status</p>
                        <p className="font-medium text-gray-900 capitalize">{registration.status || 'Pending'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Category</p>
                        <p className="font-medium text-gray-900">{registration.category || '-'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Country</p>
                        <p className="font-medium text-gray-900">{registration.country || '-'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Registered</p>
                        <p className="font-medium text-gray-900">
                          {new Date(registration.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUser className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">You haven't registered for the conference yet.</p>
                  <Link href="/participate/register" className="btn-primary">
                    Register Now
                  </Link>
                </div>
              )}

              {/* Speaker Sessions - Show for speakers */}
              {currentUser.role === 'speaker' && sessions && sessions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Sessions</h2>
                    <Link href="/programme" className="btn-primary text-sm">
                      View Full Programme
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {sessions.map((session: any) => (
                      <div key={session.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-900 mb-3">{session.title}</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          {session.date && (
                            <div className="flex items-center gap-2">
                              <FiCalendar className="w-4 h-4" />
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                          )}
                          {session.startTime && (
                            <div className="flex items-center gap-2">
                              <FiTime className="w-4 h-4" />
                              <span>
                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                {session.endTime && new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                          {session.venue && (
                            <div className="flex items-center gap-2">
                              <FiMapPin className="w-4 h-4" />
                              <span>{session.venue}</span>
                            </div>
                          )}
                          {session.type && (
                            <div className="flex items-center gap-2">
                              <FiMic className="w-4 h-4" />
                              <span className="capitalize">{session.type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Abstract Submissions - Show for presenters and contributors */}
              {(currentUser.role === 'presenter' || currentUser.role === 'contributor' || abstractSubmissions.length > 0) && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Abstracts</h2>
                    <Link href="/participate/submit-abstract" className="btn-primary text-sm">
                      Submit New Abstract
                    </Link>
                  </div>

                  {abstractSubmissions.length > 0 ? (
                    <DashboardClient abstracts={abstractSubmissions} statusConfig={statusConfig} />
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
              )}

              {/* Speaker Profile Management - Show for speakers */}
              {currentUser.role === 'speaker' && speakerData && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Speaker Profile</h2>
                    <Link href={`/programme/speakers/${speakerData.id}`} className="btn-outline text-sm">
                      <FiEye className="mr-2" />
                      View Public Profile
                    </Link>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Title</p>
                      <p className="font-medium text-gray-900">{speakerData.title}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Organization</p>
                      <p className="font-medium text-gray-900">{speakerData.organization}</p>
                    </div>
                    {speakerData.type && Array.isArray(speakerData.type) && speakerData.type.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Speaker Type</p>
                        <div className="flex flex-wrap gap-2">
                          {speakerData.type.map((type: string) => (
                            <span key={type} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {currentUser.role === 'presenter' || currentUser.role === 'contributor' ? (
                    <Link href="/participate/submit-abstract" className="btn-primary w-full justify-center text-sm">
                      Submit Abstract
                    </Link>
                  ) : null}
                  {!registration && (
                    <Link href="/participate/register" className="btn-primary w-full justify-center text-sm">
                      Register Now
                    </Link>
                  )}
                  <Link href="/programme" className="btn-outline w-full justify-center text-sm">
                    View Programme
                  </Link>
                  <Link href="/track" className="btn-outline w-full justify-center text-sm">
                    Track Status
                  </Link>
                  <Link href="/contact" className="btn-outline w-full justify-center text-sm">
                    Contact Support
                  </Link>
                  <Link href="/forgot-password" className="btn-outline w-full justify-center text-sm">
                    <FiLock className="mr-2" />
                    Reset Password
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

              {/* Account Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Account Status</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium text-gray-900 capitalize">{currentUser.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Registration</span>
                    <span className={`font-medium ${registration ? 'text-green-600' : 'text-gray-400'}`}>
                      {registration ? 'Registered' : 'Not Registered'}
                    </span>
                  </div>
                  {currentUser.role === 'presenter' && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Abstracts</span>
                      <span className="font-medium text-gray-900">{abstractSubmissions.length}</span>
                    </div>
                  )}
                  {currentUser.role === 'speaker' && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sessions</span>
                      <span className="font-medium text-gray-900">{sessions.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Help */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about your account, registration, or submissions?
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
