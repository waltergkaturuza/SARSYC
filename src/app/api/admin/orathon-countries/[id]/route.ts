import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureOrathonCountriesSchema } from '@/lib/ensureOrathonCountriesSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()
    await ensureOrathonCountriesSchema(payload)
    const doc = await payload.findByID({
      collection: 'orathon-countries' as any,
      id: params.id,
      depth: 1,
      overrideAccess: true,
    })
    return NextResponse.json({ doc })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Not found' }, { status: 404 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()
    await ensureOrathonCountriesSchema(payload)
    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.country != null) data.country = body.country
    if (body.title != null) data.title = body.title
    if (body.description !== undefined) data.description = body.description || null
    if (body.registrationUrl != null) data.registrationUrl = body.registrationUrl
    if (body.displayOrder != null) data.displayOrder = Number(body.displayOrder)
    if (body.active != null) data.active = body.active !== false

    if (body.flyerUrl) {
      const flyerUrl = body.flyerUrl as string
      const urlParts = flyerUrl.split('/')
      const filename = urlParts[urlParts.length - 1] || 'orathon-flyer'
      let mimeType = 'image/png'
      if (/\.jpe?g$/i.test(filename)) mimeType = 'image/jpeg'
      else if (/\.webp$/i.test(filename)) mimeType = 'image/webp'
      else if (/\.gif$/i.test(filename)) mimeType = 'image/gif'

      const mediaDoc: any = await payload.create({
        collection: 'media',
        data: {
          alt: `Orathon flyer: ${body.title || params.id}`,
          filename,
          mimeType,
          url: flyerUrl,
        },
        overrideAccess: true,
      })
      data.flyer = typeof mediaDoc === 'string' ? mediaDoc : mediaDoc.id
    }

    const doc = await payload.update({
      collection: 'orathon-countries' as any,
      id: params.id,
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc })
  } catch (error: any) {
    console.error('Update orathon country error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await getPayloadClient()
    await ensureOrathonCountriesSchema(payload)
    await payload.delete({
      collection: 'orathon-countries' as any,
      id: params.id,
      overrideAccess: true,
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
