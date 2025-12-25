import payload from 'payload'
import type { Payload } from 'payload/types'
import { buildConfig } from 'payload'
import config from '../payload/payload.config'
import { getSecret } from './getSecret'

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

      // Ensure database URL exists before Payload init
      const dbUrl = process.env.DATABASE_URL
      if (!dbUrl) {
        console.error('❌ DATABASE_URL is missing in environment variables')
        throw new Error('DATABASE_URL is required. Set it in Vercel env vars for all environments.')
      }

      // Get secret from environment variable or database fallback
      const secret = await getSecret()
      
      // Validate secret is not empty
      if (!secret || secret.trim() === '') {
        throw new Error('PAYLOAD_SECRET is required. Please set it in environment variables or initialize it in the database.')
      }
      
      console.log('✅ PAYLOAD_SECRET loaded (length: ' + secret.length + ' chars)')

      // buildConfig returns a SanitizedConfig
      // Note: buildConfig may sanitize/remove the secret from the config object for security
      // This is fine - we pass the secret separately to payload.init()
      const sanitized = await buildConfig(config as any)

      // In production serverless environments, always disable onInit to avoid
      // race conditions (like duplicate collection creation). Allow explicit override
      // via DISABLE_PAYLOAD_ON_INIT env var. If not set, default to disabling in
      // production (but honor a deliberate 'false' value).
      const envOverride = process.env.DISABLE_PAYLOAD_ON_INIT
      const disableOnInit = typeof envOverride !== 'undefined' 
        ? (envOverride === 'true') 
        : (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1')

      // @ts-ignore - Init options types can differ between payload versions
      // Retry transient init failures (eg. duplicate collection slug caused by concurrent inits in serverless)
      const maxAttempts = 3
      let lastErr: any = null
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // Pass secret explicitly to payload.init
          // Always disable onInit in serverless/production to prevent duplicate collection creation
          const shouldDisableOnInit = process.env.NODE_ENV === 'production' || disableOnInit
          
          // Payload v3: secret should be passed as separate parameter, not in config
          // The sanitized config from buildConfig() should not include secret
          return await payload.init({ 
            config: sanitized, 
            secret: secret,
            disableOnInit: shouldDisableOnInit 
          })
        } catch (err: any) {
          lastErr = err
          const message = String(err?.message || '')
          const errorMessage = message.toLowerCase()
          
          // Handle duplicate collection slug errors more gracefully
          if (errorMessage.includes('collection slug already in use') || 
              errorMessage.includes('already exists') ||
              errorMessage.includes('payload-kv')) {
            console.warn(`payload.init attempt ${attempt}/${maxAttempts} - collection already exists (this is usually safe to ignore):`, message)
            
            // If it's the last attempt and it's a duplicate collection error, try to return existing instance
            if (attempt === maxAttempts) {
              // Try to get existing payload instance if available
              try {
                // Check if we can access the payload instance despite the error
                // In some cases, Payload may have initialized partially
                if (cached.client) {
                  console.log('Using cached Payload client despite initialization warning')
                  return cached.client
                }
              } catch (accessErr) {
                // Ignore access errors
              }
              
              // For duplicate collection errors, we can often continue safely
              // as the collections already exist in the database
              console.warn('Collection already exists - this may be safe to ignore if collections are already initialized')
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise((r) => setTimeout(r, attempt * 500))
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
    const error = e as Error
    console.error('❌ Payload client initialization failed:', error.message)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error stack:', error.stack)
    }
    console.error('Env summary:', {
      hasPayloadSecret: Boolean(process.env.PAYLOAD_SECRET),
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      disableOnInit: process.env.DISABLE_PAYLOAD_ON_INIT,
      vercel: process.env.VERCEL,
    })
    throw e
  }

  return cached.client
}






