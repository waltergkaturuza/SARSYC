import React from 'react'
import Link from 'next/link'
import { FiPlus, FiEdit, FiEye, FiAward, FiMapPin, FiCalendar } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import { seedPreviousConferencesIfEmpty } from '@/lib/conferencesContent'
import ConferenceDeleteButton from '@/components/admin/ConferenceDeleteButton'

export const revalidate = 0

export default async function ConferencesAdminPage() {
  const payload = await getPayloadClient()
  await ensureConferencesSchema(payload)
  await seedPreviousConferencesIfEmpty(payload)

  const results = await payload.find({
    collection: 'conferences',
    limit: 100,
    sort: '-year',
    depth: 0,
    overrideAccess: true,
  })

  const conferences = results.docs as any[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conferences</h1>
          <p className="text-gray-600 mt-1">
            Manage current and previous SARSYC editions. Marking a new edition as current moves the
            previous one into Previous Conferences automatically.
          </p>
        </div>
        <Link href="/admin/conferences/new" className="btn-primary flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add Conference
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {conferences.length === 0 ? (
          <div className="p-12 text-center">
            <FiAward className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No conferences yet</p>
            <Link href="/admin/conferences/new" className="btn-primary inline-flex items-center gap-2">
              <FiPlus className="w-5 h-5" />
              Add your first conference
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conferences.map((conference) => (
              <div key={conference.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{conference.title}</h3>
                      {conference.isCurrent ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-accent-100 text-accent-800">
                          Current
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                          Previous
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          conference.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : conference.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {conference.status || 'published'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <span className="inline-flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {conference.year}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {conference.location}
                      </span>
                    </div>
                    {conference.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2">{conference.summary}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/conferences/${conference.slug}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="View public page"
                    >
                      <FiEye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/conferences/${conference.id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <FiEdit className="w-4 h-4" />
                    </Link>
                    <ConferenceDeleteButton
                      conferenceId={String(conference.id)}
                      label={conference.title || 'this conference'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
