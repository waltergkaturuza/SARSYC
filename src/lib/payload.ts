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
        // Note: Secret validation happens in buildConfig and payload.init

      // Ensure secret is available
      const secret = process.env.PAYLOAD_SECRET || 'changeme-local'
      if (!secret || secret === 'changeme-local') {
        console.warn('⚠️  Using default PAYLOAD_SECRET. Set PAYLOAD_SECRET environment variable for production!')
      }

      // buildConfig returns a SanitizedConfig
      const sanitized = await buildConfig(config as any)

      // In production serverless environments we may want to disable onInit to avoid
      // race conditions (like duplicate collection creation). Allow explicit override
      // via DISABLE_PAYLOAD_ON_INIT env var. If not set, default to disabling in
      // production (but honor a deliberate 'false' value).
      const envOverride = process.env.DISABLE_PAYLOAD_ON_INIT
      const disableOnInit = typeof envOverride !== 'undefined' ? (envOverride === 'true') : (process.env.NODE_ENV === 'production')

      // @ts-ignore - Init options types can differ between payload versions
      // Retry transient init failures (eg. duplicate collection slug caused by concurrent inits in serverless)
      const maxAttempts = 3
      let lastErr: any = null
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // Pass secret explicitly to payload.init
          return await payload.init({ config: sanitized, secret, disableOnInit })
        } catch (err: any) {
          lastErr = err
          const message = String(err?.message || '')
          // If it's a transient duplicate collection slug error, retry after a short backoff
          if (message.includes('Collection slug already in use') || message.includes('already exists')) {
            console.warn(`payload.init attempt ${attempt} failed with transient error:`, message)
            await new Promise((r) => setTimeout(r, attempt * 250))
            continue
          }
          // Non-transient error — rethrow
          throw err
        }
      }

      // If we get here, all attempts failed — rethrow last error for visibility
      throw lastErr
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






