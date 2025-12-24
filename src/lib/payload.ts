import payload from 'payload'
import type { Payload } from 'payload/types'
import { buildConfig } from 'payload'
import config from '../payload/payload.config'

let cached = (global as any).payload

if (!cached) {
  cached = (global as any).payload = { client: null, promise: null }
}

export const getPayloadClient = async (): Promise<Payload> => {
  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    // Build and pass a sanitized config to payload.init (needed in serverless environments)
    cached.promise = (async () => {
        // Ensure a secret is present in production — make the error explicit so logs guide the deploy config.
      if (process.env.NODE_ENV === 'production' && !process.env.PAYLOAD_SECRET) {
        throw new Error('Missing PAYLOAD_SECRET environment variable. Please set PAYLOAD_SECRET in your hosting environment (Production).')
      }

      // buildConfig returns a SanitizedConfig
      const sanitized = await buildConfig(config as any)

      // In production serverless environments we disable onInit to avoid race conditions
      // (like duplicate collection creation) because migrations are run separately during CI/deploy.
      // Allow override via DISABLE_PAYLOAD_ON_INIT env var for flexibility.
      const disableOnInit = (process.env.DISABLE_PAYLOAD_ON_INIT === 'true') || (process.env.NODE_ENV === 'production')

      // @ts-ignore - Init options types can differ between payload versions
      return payload.init({ config: sanitized, disableOnInit })
    })()
  }

  try {
    cached.client = await cached.promise
  } catch (e: unknown) {
    cached.promise = null
    throw e
  }

  return cached.client
}



