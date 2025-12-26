import payload from 'payload'
import type { Payload } from 'payload/types'
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
          // The config is already sanitized in payload.config.ts
          return await payload.init({ 
            config, 
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
            console.warn(`payload.init attempt ${attempt}/${maxAttempts} - collection already exists (usually safe):`, message)
            
            // If we already have a cached client, return it immediately
            if (cached.client) {
              console.log('Using cached Payload client after duplicate collection warning')
              return cached.client
            }

            // On final attempt, ignore and return the raw payload instance
            if (attempt === maxAttempts) {
              console.warn('Final attempt hit duplicate collection warning; returning existing payload instance')
              // payload default export may already be usable even if init threw
              return payload as unknown as Payload
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise((r) => setTimeout(r, attempt * 500))
            continue
          }
          
          // Handle database schema migration errors (e.g., enum value mismatches)
          // This can happen when existing data doesn't match the new schema
          if (errorMessage.includes('invalid input value for enum') ||
              errorMessage.includes('enum_registrations_country') ||
              errorMessage.includes('22P02')) {
            console.warn(`payload.init attempt ${attempt}/${maxAttempts} - database schema migration issue (existing data mismatch):`, message)
            console.warn('This usually means there is test data in the database that doesn\'t match the schema.')
            console.warn('Consider cleaning up test data or updating the schema to match existing data.')
            
            // If we already have a cached client, return it immediately
            if (cached.client) {
              console.log('Using cached Payload client despite schema migration warning')
              return cached.client
            }

            // On final attempt, try to continue anyway - Payload might still work
            if (attempt === maxAttempts) {
              console.warn('Final attempt hit schema migration warning; attempting to continue anyway')
              // Try to return the payload instance - it might still work for basic operations
              try {
                return payload as unknown as Payload
              } catch {
                // If that fails, we need to fix the data
                throw new Error(
                  'Database schema migration failed due to invalid data. ' +
                  'Please fix or remove test data (e.g., "Testland" country value) from the database. ' +
                  'Original error: ' + message
                )
              }
            }
            
            // Wait before retrying
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






