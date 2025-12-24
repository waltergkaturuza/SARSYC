import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Lazy/dynamic import to avoid initializing Payload at module-load time (prevents serverless init races)
    let payload: any = null
    try {
      const mod = await import('@/lib/payload')
      if (mod?.getPayloadClient) {
        payload = await mod.getPayloadClient()
      }
    } catch (e: any) {
      console.warn('Payload client could not be imported/initialized, will attempt DB fallback:', String(e?.message || e))
      payload = null
    }

    if (payload) {
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

        // Send confirmation email (fire-and-forget)
        try {
          const { sendRegistrationConfirmation } = await import('@/lib/mail')
          void sendRegistrationConfirmation({
            to: registration.email,
            firstName: registration.firstName || registration.first_name,
            registrationId: registration.registrationId || registration.registration_id,
          })
        } catch (e: any) {
          console.warn('Could not send confirmation email (payload path):', e?.message || e)
        }

        return NextResponse.json({
          success: true,
          doc: registration,
          message: 'Registration successful',
        })
      } catch (err: any) {
        // If Payload create fails, fall through to DB fallback
        console.error('Payload create failed, falling back to DB insert:', String(err?.message || err))
      }
    }

    // DB fallback (or primary if payload is not available)
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

      // Fire-and-forget: send email and increment telemetry counter
      try {
        const { sendRegistrationConfirmation } = await import('@/lib/mail')
        void sendRegistrationConfirmation({
          to: insert.rows[0].email,
          firstName: insert.rows[0].first_name,
          registrationId: insert.rows[0].registration_id,
        })
      } catch (e: any) {
        console.warn('Could not send confirmation email (DB fallback):', e?.message || e)
      }

      try {
        const { incrementFallback } = await import('@/lib/telemetry')
        void incrementFallback('registrations', { reason: 'db_fallback' })
      } catch (e: any) {
        console.warn('Could not increment fallback metric:', e?.message || e)
      }

      return NextResponse.json({ success: true, doc: insert.rows[0], message: 'Registration successful (DB fallback)' }, { status: 201 })
    } catch (dbErr: any) {
      console.error('DB fallback failed:', dbErr)
      return NextResponse.json({ success: false, error: dbErr.message || 'DB fallback failed' }, { status: 500 })
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
    // Lazy import for GET to avoid module-time init
    const mod = await import('@/lib/payload')
    const payload = mod?.getPayloadClient ? await mod.getPayloadClient() : null

    if (!payload) {
      return NextResponse.json({ error: 'Payload not available in this environment' }, { status: 503 })
    }

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



