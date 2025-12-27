import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const sponsorshipTierSchema = z.object({
  name: z.string().min(2),
  price: z.string().min(1),
  order: z.number().int().min(0),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  icon: z.enum(['star', 'award', 'trending', 'heart', 'diamond', 'trophy']),
  color: z.enum(['gray', 'yellow', 'silver', 'orange', 'blue', 'purple', 'green', 'red']),
  benefits: z.array(z.object({ benefit: z.string().min(1) })).min(1),
  description: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromCookies()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = sponsorshipTierSchema.parse(body)

    const payload = await getPayloadClient()

    const tier = await payload.update({
      collection: 'sponsorship-tiers',
      id: params.id,
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      tier,
    })
  } catch (error: any) {
    console.error('Error updating sponsorship tier:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update sponsorship tier' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromCookies()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await getPayloadClient()

    await payload.delete({
      collection: 'sponsorship-tiers',
      id: params.id,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Error deleting sponsorship tier:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete sponsorship tier' },
      { status: 500 }
    )
  }
}

