import payload from 'payload'
import type { Payload } from 'payload/types'

let cached = (global as any).payload

if (!cached) {
  cached = (global as any).payload = { client: null, promise: null }
}

export const getPayloadClient = async (): Promise<Payload> => {
  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    // Type definitions for payload.init differ between versions — cast to any to avoid build-time type errors
    // @ts-ignore
    cached.promise = payload.init({
      // secret is provided at runtime via environment variables
      secret: process.env.PAYLOAD_SECRET!,
      local: true,
    } as any)
  }

  try {
    cached.client = await cached.promise
  } catch (e: unknown) {
    cached.promise = null
    throw e
  }

  return cached.client
}


