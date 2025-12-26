import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update data
    const updateData: any = {
      name,
      description: description || undefined,
      type,
      tier: tier || undefined,
      website: website || undefined,
      active,
      sarsycEditions,
      displayOrder,
    }
    
    if (logoId) {
      updateData.logo = logoId
    }

    // Update partner
    const partner = await payload.update({
      collection: 'partners',
      id: params.id,
      data: updateData,
    })

    return NextResponse.json({ success: true, doc: partner })
  } catch (error: any) {
    console.error('Update partner error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update partner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadClient()
    
    await payload.delete({
      collection: 'partners',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete partner error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete partner' },
      { status: 500 }
    )
  }
}


