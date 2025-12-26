import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const tier = formData.get('tier') as string | null
    const website = formData.get('website') as string | null
    const active = formData.get('active') === 'true'
    const sarsycEditions = JSON.parse(formData.get('sarsycEditions') as string || '[]')
    const displayOrder = formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : undefined
    const logoFile = formData.get('logo') as File | null
    
    // Upload logo if provided
    let logoId: string | undefined
    if (logoFile && logoFile.size > 0) {
      const logoUpload = await payload.create({
        collection: 'media',
        data: {},
        file: logoFile,
      })
      logoId = typeof logoUpload === 'string' ? logoUpload : logoUpload.id
    }

    // Create partner
    const partner = await payload.create({
      collection: 'partners',
      data: {
        name,
        description: description || undefined,
        type,
        tier: tier || undefined,
        website: website || undefined,
        active,
        sarsycEditions,
        displayOrder,
        ...(logoId && { logo: logoId }),
      },
    })

    return NextResponse.json({ success: true, doc: partner })
  } catch (error: any) {
    console.error('Create partner error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create partner' },
      { status: 500 }
    )
  }
}


