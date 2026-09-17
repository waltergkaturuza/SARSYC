import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/lib/payload'
import { ensureOrathonCountriesSchema } from '@/lib/ensureOrathonCountriesSchema'
import OrathonCountryForm from '@/components/admin/forms/OrathonCountryForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditOrathonCountryPage({
  params,
}: {
  params: { id: string }
}) {
  const payload = await getPayloadClient()
  await ensureOrathonCountriesSchema(payload)

  try {
    const doc = await payload.findByID({
      collection: 'orathon-countries' as any,
      id: params.id,
      depth: 1,
      overrideAccess: true,
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Orathon country</h1>
          <p className="text-gray-600 mt-1">Update registration link, flyer, or visibility</p>
        </div>
        <OrathonCountryForm mode="edit" initialData={doc} />
      </div>
    )
  } catch {
    notFound()
  }
}
