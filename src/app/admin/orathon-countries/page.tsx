import Link from 'next/link'
import { FiPlus, FiEdit2, FiExternalLink } from 'react-icons/fi'
import { getPayloadClient } from '@/lib/payload'
import { ensureOrathonCountriesSchema } from '@/lib/ensureOrathonCountriesSchema'
import { getCountryLabel } from '@/lib/countries'
import CountryFlag from '@/components/ui/CountryFlag'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OrathonCountriesAdminPage() {
  const payload = await getPayloadClient()
  await ensureOrathonCountriesSchema(payload)

  const result = await payload.find({
    collection: 'orathon-countries' as any,
    limit: 100,
    sort: 'displayOrder',
    depth: 1,
    overrideAccess: true,
  })

  const docs = result.docs || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orathon Countries</h1>
          <p className="text-gray-600 mt-1">
            Manage country registration links and flyers shown on the Orathon page
          </p>
        </div>
        <Link href="/admin/orathon-countries/new" className="btn-primary inline-flex items-center gap-2">
          <FiPlus className="w-5 h-5" />
          Add country
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No countries yet. Add Zimbabwe, Namibia, or any future country with its link and flyer.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {docs.map((doc: any) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 md:p-5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CountryFlag countryOrCode={doc.country} size="md" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {getCountryLabel(doc.country)} — {doc.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{doc.registrationUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      doc.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {doc.active ? 'Active' : 'Hidden'}
                  </span>
                  {doc.flyer?.url && (
                    <span className="text-xs text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                      Flyer
                    </span>
                  )}
                  <a
                    href={doc.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-primary-700"
                    title="Open registration link"
                  >
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    href={`/admin/orathon-countries/${doc.id}/edit`}
                    className="p-2 text-gray-500 hover:text-primary-700"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
