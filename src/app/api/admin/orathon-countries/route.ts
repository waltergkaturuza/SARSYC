import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { ensureOrathonCountriesSchema } from '@/lib/ensureOrathonCountriesSchema'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    await ensureOrathonCountriesSchema(payload)

    const result = await payload.find({
      collection: 'orathon-countries' as any,
      limit: 100,
      sort: 'displayOrder',
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({ docs: result.docs, totalDocs: result.totalDocs })
  } catch (error: any) {
    console.error('List orathon countries error:', error)
    return NextResponse.json({ error: error.message || 'Failed to list' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    await ensureOrathonCountriesSchema(payload)
    const body = await request.json()

    const country = body.country
    const title = body.title
    const description = body.description || null
    const registrationUrl = body.registrationUrl
    const displayOrder = body.displayOrder != null ? Number(body.displayOrder) : 0
    const active = body.active !== false
    const flyerUrl = body.flyerUrl || null

    if (!country || !title || !registrationUrl) {
      return NextResponse.json(
        { error: 'country, title, and registrationUrl are required' },
        { status: 400 },
      )
    }

    let flyerId: string | number | undefined
    if (flyerUrl) {
      const urlParts = flyerUrl.split('/')
      const filename = urlParts[urlParts.length - 1] || 'orathon-flyer'
      let mimeType = 'image/png'
      if (/\.jpe?g$/i.test(filename)) mimeType = 'image/jpeg'
      else if (/\.webp$/i.test(filename)) mimeType = 'image/webp'
      else if (/\.gif$/i.test(filename)) mimeType = 'image/gif'

      const mediaDoc: any = await payload.create({
        collection: 'media',
        data: {
          alt: `Orathon flyer: ${title}`,
          filename,
          mimeType,
          url: flyerUrl,
        },
        overrideAccess: true,
      })
      flyerId = typeof mediaDoc === 'string' ? mediaDoc : mediaDoc.id
    }

    const doc = await payload.create({
      collection: 'orathon-countries' as any,
      data: {
        country,
        title,
        description,
        registrationUrl,
        displayOrder,
        active,
        ...(flyerId != null ? { flyer: flyerId } : {}),
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true, doc })
  } catch (error: any) {
    console.error('Create orathon country error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create' }, { status: 500 })
  }
}
