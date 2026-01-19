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
    const logoUrl = formData.get('logoUrl') as string | null // URL from blob storage
    
    // Create media record with the blob URL if provided
    let logoId: string | undefined
    if (logoUrl) {
      try {
        // Extract filename from URL for better metadata
        const urlParts = logoUrl.split('/')
        const filename = urlParts[urlParts.length - 1] || 'partner-logo'
        
        // Determine MIME type from file extension
        let mimeType = 'image/png' // Default
        if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) {
          mimeType = 'image/jpeg'
        } else if (filename.toLowerCase().endsWith('.gif')) {
          mimeType = 'image/gif'
        } else if (filename.toLowerCase().endsWith('.webp')) {
          mimeType = 'image/webp'
        } else if (filename.toLowerCase().endsWith('.svg')) {
          mimeType = 'image/svg+xml'
        }
        
        // Create media record with the blob URL
        const result = await payload.db.collections.media.create({
          data: {
            alt: `Partner logo: ${name}`,
            filename: filename,
            mimeType: mimeType,
            url: logoUrl,
            filesize: 0,
            width: null,
            height: null,
          },
        })
        logoId = typeof result === 'string' ? result : result.id
        console.log('✅ Created media record with blob URL:', logoUrl)
      } catch (uploadError: any) {
        console.error('Media record creation error:', uploadError)
        // Continue without logo if media creation fails
        console.warn('Partner update proceeding without media record')
      }
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



