import type { Payload } from 'payload'
import type { NextRequest } from 'next/server'

/**
 * Record a site-events row from a server route (downloads, form submits, etc.).
 * Failures are logged and ignored so tracking never blocks the main response.
 */
export async function recordSiteEvent(
  payload: Payload,
  data: {
    eventType: string
    path?: string
    sessionId?: string
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  try {
    const sid =
      typeof data.sessionId === 'string' && data.sessionId.trim().length >= 8
        ? data.sessionId.trim()
        : `srv_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

    await payload.create({
      collection: 'site-events',
      data: {
        eventType: data.eventType,
        path: data.path?.substring(0, 500),
        sessionId: sid,
        metadata: data.metadata,
      },
      overrideAccess: true,
    })
  } catch (error) {
    console.warn('recordSiteEvent failed:', error)
  }
}

export function pathFromReferer(request: NextRequest | Request, fallback = '/'): string {
  const referer = request.headers.get('referer')
  if (!referer) return fallback
  try {
    return new URL(referer).pathname || fallback
  } catch {
    return fallback
  }
}

/** Convenience: form_submit with label + optional form key. */
export async function recordFormSubmit(
  payload: Payload,
  request: NextRequest | Request,
  form: string,
  label: string,
  extra?: Record<string, unknown>,
): Promise<void> {
  await recordSiteEvent(payload, {
    eventType: 'form_submit',
    path: pathFromReferer(request),
    metadata: { form, label, ...extra },
  })
}
