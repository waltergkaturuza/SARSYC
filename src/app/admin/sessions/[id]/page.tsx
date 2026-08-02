import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiEdit, FiArrowLeft, FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi'
import { format } from 'date-fns'
import { slateToSimpleHtml } from '@/lib/newsContent'
import {
  formatSessionTime,
  formatSessionDate,
  sessionTrackLabel,
  sessionDayLabel,
  sessionTypeLabel,
  sessionStatusLabel,
  formatSpeakerNamesList,
} from '@/lib/sessionsContent'
import SessionDeleteButton from '@/components/admin/SessionDeleteButton'
import SessionPublishButton from '@/components/admin/SessionPublishButton'

export const revalidate = 0

interface SessionDetailPageProps {
  params: {
    id: string
  }
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const payload = await getPayloadClient()
  
  try {
    const session = await payload.findByID({
      collection: 'sessions',
      id: params.id,
      depth: 2,
      overrideAccess: true,
    })

    const startTime = formatSessionTime(session.startTime)
    const endTime = formatSessionTime(session.endTime)
    const date = formatSessionDate(session.date)

    return (
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/sessions" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Sessions</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <SessionPublishButton
              sessionId={String(params.id)}
              status={(session as { status?: string }).status || 'published'}
              variant="button"
            />
            <SessionDeleteButton
              sessionId={String(params.id)}
              label={session.title || 'this session'}
              variant="button"
            />
            <Link href={`/admin/sessions/${params.id}/edit`} className="btn-primary flex items-center gap-2">
              <FiEdit className="w-5 h-5" />
              Edit Session
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Session Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <FiCalendar className="w-6 h-6" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {sessionTypeLabel(session.type)}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {sessionStatusLabel((session as { status?: string }).status || 'published')}
                  </span>
                  {session.day && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {sessionDayLabel(session.day)}
                    </span>
                  )}
                  {session.track && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {sessionTrackLabel(session.track)}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-5 h-5" />
                    <span>{startTime} - {endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-5 h-5" />
                    <span>{session.venue}</span>
                  </div>
                  {session.capacity && (
                    <div className="flex items-center gap-2">
                      <FiUsers className="w-5 h-5" />
                      <span>Capacity: {session.capacity}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Description */}
            {session.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Description</h3>
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: slateToSimpleHtml(session.description) }}
                />
              </div>
            )}

            {/* Speakers */}
            {session.speakers && Array.isArray(session.speakers) && session.speakers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Speakers</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {session.speakers.map((speaker: any) => (
                    <Link
                      key={typeof speaker === 'string' ? speaker : speaker.id}
                      href={`/admin/speakers/${typeof speaker === 'string' ? speaker : speaker.id}`}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {typeof speaker === 'string' ? speaker : speaker.name}
                      </div>
                      {typeof speaker !== 'string' && speaker.title && (
                        <div className="text-sm text-gray-600">{speaker.title}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Youth Steering Committee members */}
            {Array.isArray(session.committeeMembers) && session.committeeMembers.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Youth Steering Committee</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {session.committeeMembers.map((member: any) => (
                    <Link
                      key={typeof member === 'object' ? member.id : member}
                      href={`/admin/youth-steering-committee/${typeof member === 'object' ? member.id : member}`}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {typeof member === 'object' ? member.name : member}
                      </div>
                      {typeof member === 'object' && member.role && (
                        <div className="text-sm text-gray-600">{member.role}</div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Additional guest speakers (free-text names) */}
            {session.speakerNames && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Additional Speakers</h3>
                <div className="flex flex-wrap gap-2">
                  {formatSpeakerNamesList(session.speakerNames).map((name: string) => (
                    <span key={name} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Moderator */}
            {session.moderator && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Moderator</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">
                    {typeof session.moderator === 'string' ? session.moderator : session.moderator.name}
                  </div>
                  {typeof session.moderator !== 'string' && session.moderator.title && (
                    <div className="text-sm text-gray-600">{session.moderator.title}</div>
                  )}
                </div>
              </div>
            )}

            {/* Registration Requirement */}
            {session.requiresRegistration && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">This session requires separate registration</p>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  <span className="text-gray-900">
                    {session.createdAt ? format(new Date(session.createdAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>{' '}
                  <span className="text-gray-900">
                    {session.updatedAt ? format(new Date(session.updatedAt), 'PPpp') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}



