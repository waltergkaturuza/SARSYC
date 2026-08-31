import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiArrowLeft } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { ensureConferencesSchema } from '@/lib/ensureConferencesSchema'
import ConferenceForm from '@/components/admin/forms/ConferenceForm'
import ConferenceDeleteButton from '@/components/admin/ConferenceDeleteButton'

export const revalidate = 0

export default async function EditConferencePage({ params }: { params: { id: string } }) {
  const payload = await getPayloadClient()
  await ensureConferencesSchema(payload)

  let conference: any
  try {
    conference = await payload.findByID({
      collection: 'conferences',
      id: params.id,
      depth: 1,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/conferences"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Conferences
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit {conference.title}</h1>
        </div>
        <ConferenceDeleteButton
          conferenceId={String(conference.id)}
          label={conference.title || 'this conference'}
          variant="button"
        />
      </div>
      <ConferenceForm mode="edit" initialData={conference} />
    </div>
  )
}
