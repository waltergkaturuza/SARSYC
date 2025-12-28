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
    const title = formData.get('title') as string
    const abstract = formData.get('abstract') as string
    const keywords = JSON.parse(formData.get('keywords') as string || '[]')
    const track = formData.get('track') as string
    const primaryAuthor = JSON.parse(formData.get('primaryAuthor') as string || '{}')
    const coAuthors = JSON.parse(formData.get('coAuthors') as string || '[]')
    const presentationType = formData.get('presentationType') as string
    const status = formData.get('status') as string
    const reviewerComments = formData.get('reviewerComments') as string | null
    const adminNotes = formData.get('adminNotes') as string | null
    const assignedSession = formData.get('assignedSession') as string | null
    const abstractFile = formData.get('abstractFile') as File | null
    
    // Upload file if provided
    let abstractFileId: string | undefined
    if (abstractFile && abstractFile.size > 0) {
      try {
        const fileUpload = await payload.create({
          collection: 'media',
          data: {
            alt: `Abstract file: ${title}`,
          },
          file: abstractFile,
          overrideAccess: true, // Allow admin uploads
        })
        abstractFileId = typeof fileUpload === 'string' ? fileUpload : fileUpload.id
      } catch (uploadError: any) {
        console.error('File upload error:', uploadError)
        // Continue without file if upload fails
        console.warn('Abstract update proceeding without file upload')
      }
    }

    // Update data
    const updateData: any = {
      title,
      abstract,
      keywords: keywords.map((k: string) => ({ keyword: k })),
      track,
      primaryAuthor,
      coAuthors: coAuthors.map((ca: any) => ({ name: ca.name, organization: ca.organization })),
      presentationType,
      status,
    }
    
    // Always include these fields, even if empty (to allow clearing)
    updateData.reviewerComments = reviewerComments || null
    updateData.adminNotes = adminNotes || null
    
    if (abstractFileId) {
      updateData.abstractFile = abstractFileId
    }
    if (assignedSession) {
      updateData.assignedSession = assignedSession
    }

    // Update abstract
    const abstractDoc = await payload.update({
      collection: 'abstracts',
      id: params.id,
      data: updateData,
    })

    return NextResponse.json({ success: true, doc: abstractDoc })
  } catch (error: any) {
    console.error('Update abstract error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update abstract' },
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
      collection: 'abstracts',
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete abstract error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete abstract' },
      { status: 500 }
    )
  }
}



