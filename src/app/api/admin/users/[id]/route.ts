import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const payload = await getPayloadClient()
    
    const user = await payload.findByID({
      collection: 'users',
      id: params.id,
    })

    // Remove sensitive fields
    const { hash, salt, resetPasswordToken, resetPasswordExpiration, ...safeUser } = user as any

    return NextResponse.json({
      success: true,
      doc: safeUser,
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const payload = await getPayloadClient()

    // Extract form fields
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const role = formData.get('role') as string
    const organization = formData.get('organization') as string | null
    const phone = formData.get('phone') as string | null
    const password = formData.get('password') as string | null

    // Validate required fields
    if (!firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'First name, last name, and role are required' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {
      firstName,
      lastName,
      role: role as 'admin' | 'editor' | 'contributor',
      organization: organization || undefined,
      phone: phone || undefined,
    }

    // Only update password if provided
    if (password && password.length > 0) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        )
      }
      updateData.password = password
    }

    // Update user
    const user = await payload.update({
      collection: 'users',
      id: params.id,
      data: updateData,
    })

    // Remove sensitive fields
    const { hash, salt, resetPasswordToken, resetPasswordExpiration, ...safeUser } = user as any

    return NextResponse.json({
      success: true,
      doc: safeUser,
      message: 'User updated successfully',
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUserFromRequest(request)
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Prevent self-deletion
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    const payload = await getPayloadClient()

    // Delete user
    await payload.delete({
      collection: 'users',
      id: params.id,
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}




