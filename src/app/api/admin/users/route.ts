import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentUserFromRequest } from '@/lib/getCurrentUser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Create new user
export async function POST(request: NextRequest) {
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
    const email = formData.get('email') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const role = formData.get('role') as string
    const organization = formData.get('organization') as string | null
    const phone = formData.get('phone') as string | null
    const password = formData.get('password') as string | null

    // Validate required fields
    if (!email || !firstName || !lastName || !role || !password) {
      return NextResponse.json(
        { error: 'Email, first name, last name, role, and password are required' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user with email already exists
    const existing = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Create user
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        firstName,
        lastName,
        role: role as 'admin' | 'editor' | 'contributor',
        password, // Payload will hash this automatically
        organization: organization || undefined,
        phone: phone || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      doc: user,
      message: 'User created successfully',
    })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}

// Get all users (list)
export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    
    if (role && role !== 'all') {
      where.role = { equals: role }
    }
    
    if (search) {
      where.or = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { organization: { contains: search } },
      ]
    }

    const results = await payload.find({
      collection: 'users',
      where,
      limit,
      page,
      sort: '-createdAt',
    })

    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}




