import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiUser } from 'react-icons/fi'

export const revalidate = 0

interface VolunteerDetailPageProps {
  params: {
    id: string
  }
}

export default async function VolunteerDetailPage({ params }: VolunteerDetailPageProps) {
  const payload = await getPayloadClient()

  let volunteer: any
  try {
    volunteer = await payload.findByID({
      collection: 'volunteers',
      id: params.id,
      depth: 2,
    })
  } catch (e) {
    return notFound()
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '—'
    try {
      return new Date(value).toLocaleDateString()
    } catch {
      return value
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/admin/volunteers"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Back to Volunteers
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUser className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm text-white/80">Volunteer ID</div>
                  <div className="text-xl font-mono font-semibold">
                    {volunteer.volunteerId || 'N/A'}
                  </div>
                </div>
              </div>
              <h1 className="text-2xl font-bold">
                {volunteer.firstName} {volunteer.lastName}
              </h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/90">
                {volunteer.email && (
                  <span className="inline-flex items-center gap-1">
                    <FiMail className="w-4 h-4" />
                    {volunteer.email}
                  </span>
                )}
                {volunteer.phone && (
                  <span className="inline-flex items-center gap-1">
                    <FiPhone className="w-4 h-4" />
                    {volunteer.phone}
                  </span>
                )}
                {(volunteer.country || volunteer.city) && (
                  <span className="inline-flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {[volunteer.city, volunteer.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right text-sm space-y-2">
              <div>
                <div className="font-medium">Status</div>
                <div className="mt-1 inline-flex px-3 py-1 rounded-full bg-white/10 capitalize">
                  {volunteer.status || 'pending'}
                </div>
              </div>
              <div className="text-xs text-white/80 space-y-1">
                <div>
                  <span className="font-semibold">Applied:</span>{' '}
                  {formatDate(volunteer.createdAt)}
                </div>
                <div>
                  <span className="font-semibold">Last updated:</span>{' '}
                  {formatDate(volunteer.updatedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-8">
          {/* Top row: personal + preferences + availability */}
          <div className="grid gap-6 lg:grid-cols-3">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Personal Information
              </h2>
              <dl className="space-y-2 text-sm text-gray-700">
                <div>
                  <dt className="font-medium">Full Name</dt>
                  <dd>
                    {volunteer.firstName} {volunteer.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd>{volunteer.email || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Phone</dt>
                  <dd>{volunteer.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Date of Birth</dt>
                  <dd>{formatDate(volunteer.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt className="font-medium">Gender</dt>
                  <dd className="capitalize">{volunteer.gender || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Location</dt>
                  <dd>
                    {[volunteer.address, volunteer.city, volunteer.country]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Volunteer Preferences
              </h2>
              <dl className="space-y-2 text-sm text-gray-700">
                <div>
                  <dt className="font-medium">Preferred Roles</dt>
                  <dd>
                    {Array.isArray(volunteer.preferredRoles) &&
                    volunteer.preferredRoles.length
                      ? volunteer.preferredRoles.join(', ')
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Available Days</dt>
                  <dd>
                    {volunteer.availability?.days?.length
                      ? volunteer.availability.days.join(', ')
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Time Preference</dt>
                  <dd>{volunteer.availability?.timePreference || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Total Hours Available</dt>
                  <dd>
                    {volunteer.availability?.hoursAvailable
                      ? `${volunteer.availability.hoursAvailable} hours`
                      : '—'}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Admin & Screening
              </h2>
              <dl className="space-y-2 text-sm text-gray-700">
                <div>
                  <dt className="font-medium">Assigned Reviewer</dt>
                  <dd>
                    {typeof volunteer.assignedReviewer === 'object' &&
                    volunteer.assignedReviewer
                      ? `${volunteer.assignedReviewer.firstName || ''} ${
                          volunteer.assignedReviewer.lastName || ''
                        }`.trim() || volunteer.assignedReviewer.email
                      : volunteer.assignedReviewer || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Interview Date</dt>
                  <dd>{formatDate(volunteer.interviewDate)}</dd>
                </div>
                <div>
                  <dt className="font-medium">Interview Notes</dt>
                  <dd>{volunteer.interviewNotes || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium">Admin Notes</dt>
                  <dd>
                    {volunteer.adminNotes ? (
                      <p className="whitespace-pre-wrap">{volunteer.adminNotes}</p>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Reviewer Comments</dt>
                  <dd>
                    {volunteer.reviewerComments ? (
                      <p className="whitespace-pre-wrap">{volunteer.reviewerComments}</p>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Education & skills */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Education Background
              </h2>
              {Array.isArray(volunteer.education) && volunteer.education.length > 0 ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {volunteer.education.map((edu: any, idx: number) => (
                    <li
                      key={idx}
                      className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="font-medium">
                        {edu.level ? edu.level.replace('-', ' ') : 'Education'} •{' '}
                        {edu.field}
                      </div>
                      <div className="text-xs text-gray-600">
                        {edu.institution}
                        {edu.year && ` • ${edu.year}`}
                        {edu.currentlyStudying && ' • Currently studying'}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No education details provided.</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Skills & Languages
              </h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-medium mb-1">Technical Skills</h3>
                  {Array.isArray(volunteer.skills?.technical) &&
                  volunteer.skills.technical.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {volunteer.skills.technical.map((item: any, idx: number) => (
                        <li
                          key={idx}
                          className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800"
                        >
                          {item.skill}
                          {item.proficiency && (
                            <span className="ml-1 text-[10px] uppercase opacity-75">
                              • {item.proficiency}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No technical skills listed.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-1">Soft Skills</h3>
                  {Array.isArray(volunteer.skills?.soft) &&
                  volunteer.skills.soft.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {volunteer.skills.soft.map((item: any, idx: number) => (
                        <li
                          key={idx}
                          className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-800"
                        >
                          {item.skill}
                          {item.proficiency && (
                            <span className="ml-1 text-[10px] uppercase opacity-75">
                              • {item.proficiency}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No soft skills listed.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-1">Languages</h3>
                  {Array.isArray(volunteer.skills?.languages) &&
                  volunteer.skills.languages.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {volunteer.skills.languages.map((item: any, idx: number) => (
                        <li
                          key={idx}
                          className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs text-green-800"
                        >
                          {item.language}
                          {item.proficiency && (
                            <span className="ml-1 text-[10px] uppercase opacity-75">
                              • {item.proficiency}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No languages listed.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Experience sections */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Work Experience
              </h2>
              {Array.isArray(volunteer.workExperience) &&
              volunteer.workExperience.length > 0 ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {volunteer.workExperience.map((job: any, idx: number) => (
                    <li
                      key={idx}
                      className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="font-medium">
                        {job.position} • {job.organization}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(job.startDate)} –{' '}
                        {job.currentlyWorking ? 'Present' : formatDate(job.endDate)}
                      </div>
                      {job.description && (
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {job.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No work experience listed.</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Previous Volunteer Experience
              </h2>
              {Array.isArray(volunteer.volunteerExperience) &&
              volunteer.volunteerExperience.length > 0 ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {volunteer.volunteerExperience.map((exp: any, idx: number) => (
                    <li
                      key={idx}
                      className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="font-medium">
                        {exp.role} • {exp.organization}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(exp.date)}
                      </div>
                      {exp.description && (
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No previous volunteer experience listed.
                </p>
              )}
            </section>
          </div>

          {/* Motivation & additional information */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Motivation & Special Skills
              </h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-medium mb-1">Motivation Statement</h3>
                  <p className="whitespace-pre-wrap">
                    {volunteer.motivation || 'No motivation statement provided.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Special Skills or Qualifications</h3>
                  <p className="whitespace-pre-wrap">
                    {volunteer.specialSkills ||
                      'No additional skills or qualifications provided.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Special Accommodations Needed</h3>
                  <p className="whitespace-pre-wrap">
                    {volunteer.specialAccommodations ||
                      'No special accommodations indicated.'}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                References & Emergency Contact
              </h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h3 className="font-medium mb-1">References</h3>
                  {Array.isArray(volunteer.references) &&
                  volunteer.references.length > 0 ? (
                    <ul className="space-y-2">
                      {volunteer.references.map((ref: any, idx: number) => (
                        <li key={idx} className="border border-gray-200 rounded-md px-3 py-2">
                          <div className="font-medium">{ref.name}</div>
                          <div className="text-xs text-gray-600">
                            {ref.relationship}
                            {ref.organization && ` • ${ref.organization}`}
                          </div>
                          <div className="text-xs text-gray-600">
                            {ref.email} • {ref.phone}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No references listed.</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-1">Emergency Contact</h3>
                  {volunteer.emergencyContact ? (
                    <dl className="space-y-1 text-sm text-gray-700">
                      <div>
                        <dt className="font-medium">Name</dt>
                        <dd>{volunteer.emergencyContact.name}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Relationship</dt>
                        <dd>{volunteer.emergencyContact.relationship}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Phone</dt>
                        <dd>{volunteer.emergencyContact.phone}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Email</dt>
                        <dd>{volunteer.emergencyContact.email || '—'}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-sm text-gray-500">No emergency contact provided.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Documents & consents */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Documents
              </h2>
              <dl className="space-y-2 text-sm text-gray-700">
                <div>
                  <dt className="font-medium">CV / Resume</dt>
                  <dd>
                    {volunteer.cv && typeof volunteer.cv === 'object' ? (
                      <Link
                        href={volunteer.cv.url || '#'}
                        className="text-primary-600 hover:underline"
                        target="_blank"
                      >
                        {volunteer.cv.filename || 'View CV'}
                      </Link>
                    ) : (
                      'Not uploaded'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Cover Letter</dt>
                  <dd>
                    {volunteer.coverLetter &&
                    typeof volunteer.coverLetter === 'object' ? (
                      <Link
                        href={volunteer.coverLetter.url || '#'}
                        className="text-primary-600 hover:underline"
                        target="_blank"
                      >
                        {volunteer.coverLetter.filename || 'View Cover Letter'}
                      </Link>
                    ) : (
                      'Not uploaded'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Associated User Account</dt>
                  <dd>
                    {volunteer.user && typeof volunteer.user === 'object'
                      ? `${volunteer.user.email} (ID: ${volunteer.user.id})`
                      : volunteer.user || '—'}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Consents & Agreements
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <span className="font-medium">Background check:</span>{' '}
                  {volunteer.consents?.backgroundCheck ? 'Yes' : 'No'}
                </li>
                <li>
                  <span className="font-medium">Photo / video consent:</span>{' '}
                  {volunteer.consents?.photoRelease ? 'Yes' : 'No'}
                </li>
                <li>
                  <span className="font-medium">Data processing consent:</span>{' '}
                  {volunteer.consents?.dataProcessing ? 'Yes' : 'No'}
                </li>
                <li>
                  <span className="font-medium">Terms accepted:</span>{' '}
                  {volunteer.consents?.termsAccepted ? 'Yes' : 'No'}
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

