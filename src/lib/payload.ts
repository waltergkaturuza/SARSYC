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
      // buildConfig returns a SanitizedConfig
      const sanitized = await buildConfig(config as any)
      // @ts-ignore - Init options types can differ between payload versions
      return payload.init({ config: sanitized })
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


