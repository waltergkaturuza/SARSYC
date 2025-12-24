import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = await getPayloadClient()

    // Create registration in Payload CMS
    try {
      const registration = await payload.create({
        collection: 'registrations',
        data: {
          ...body,
          status: 'pending',
          paymentStatus: 'pending',
        },
      })

      // TODO: Send confirmation email
      // await sendRegistrationEmail(registration)

      return NextResponse.json({
        success: true,
        doc: registration,
        message: 'Registration successful',
      })
    } catch (err: any) {
      // Fallback: if Payload initialization fails (eg. collection slug race), insert directly into DB using pg
      const msg = String(err?.message || '')
      console.error('Payload create failed, attempting DB fallback:', msg)

      if (msg.includes('Collection slug already in use') || msg.includes('payload config is required') || msg.includes('missing secret')) {
        try {
          const { Pool } = await import('pg')
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
          })

          const registrationId = `REG-${new Date().getFullYear()}-${Math.random().toString(36).substr(2,4).toUpperCase()}`

          const insert = await pool.query(
            `INSERT INTO registrations (first_name, last_name, email, phone, country, organization, category, status, payment_status, registration_id, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now(), now()) RETURNING *`,
            [
              body.firstName,
              body.lastName,
              body.email,
              body.phone,
              body.country,
              body.organization || null,
              body.category,
              'pending',
              'pending',
              registrationId,
            ]
          )

          await pool.end()

          return NextResponse.json({ success: true, doc: insert.rows[0], message: 'Registration successful (DB fallback)' }, { status: 201 })
        } catch (dbErr: any) {
          console.error('DB fallback failed:', dbErr)
          return NextResponse.json({ success: false, error: dbErr.message || 'DB fallback failed' }, { status: 500 })
        }
      }

      throw err
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Registration failed',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    // Get all registrations (admin only)
    const registrations = await payload.find({
      collection: 'registrations',
      limit: 100,
      sort: '-createdAt',
    })

    return NextResponse.json(registrations)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}



