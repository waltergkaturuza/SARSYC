import React from 'react'
import { getPayloadClient } from '@/lib/payload'
import RegistrationsTable from '@/components/admin/RegistrationsTable'

export const revalidate = 0

export default async function Page({ searchParams }: any) {
  const page = Number(searchParams.page || 1)
  const perPage = 25
  const skip = (page - 1) * perPage

  const payload = await getPayloadClient()

  // Default: exclude cancelled registrations (soft-deleted or cancelled)
  const results = await payload.find({ collection: 'registrations', where: { status: { not_equals: 'cancelled' }, deletedAt: { equals: null } }, limit: perPage, page, sort: '-createdAt' })

  const docs = results?.docs || []
  const total = results?.totalDocs || docs.length

  // Admin ID for initial local dev; production will use real session-based auth
  const adminId = process.env.ADMIN_USER_ID || ''

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Registrations</h1>
      <RegistrationsTable docs={docs} total={total} page={page} perPage={perPage} adminId={adminId} />
    </div>
  )
}
