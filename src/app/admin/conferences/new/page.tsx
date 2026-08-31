import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import ConferenceForm from '@/components/admin/forms/ConferenceForm'

export const revalidate = 0

export default function NewConferencePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/conferences"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Conferences
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add Conference</h1>
        <p className="text-gray-600 mt-1">
          Create a previous edition, or mark a new edition as current to retire the previous one.
        </p>
      </div>
      <ConferenceForm mode="create" />
    </div>
  )
}
