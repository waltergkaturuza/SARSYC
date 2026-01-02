# 🔐 JWT Token Verification Fix

## Root Cause

Payload CMS processes the `PAYLOAD_SECRET` before using it for JWT signing:
1. Hashes the secret with **SHA-256**
2. Truncates the hash to **32 characters**
3. Uses this processed secret for signing tokens

We were verifying tokens with the **raw secret**, causing "invalid signature" errors.

## Token Generation Sources

### 1. **Payload CMS Login** (`src/app/api/auth/login/route.ts`)
- **Method**: `payloadClient.login()`
- **Secret Used**: Payload's internal secret (processed: SHA-256 hash, 32 chars)
- **Token Location**: `result.token`
- **Cookie Set**: `payload-token`

### 2. **Payload Config** (`src/payload/payload.config.ts`)
- **Secret Source**: `process.env.PAYLOAD_SECRET` (synchronous, at build time)
- **Used For**: Config validation
- **Note**: Payload uses the secret passed to `payload.init()`, not this one

### 3. **Payload Init** (`src/lib/payload.ts`)
- **Secret Source**: `getSecret()` (async, from env or database)
- **Used For**: Passed to `payload.init({ secret })`
- **This is what Payload uses for signing tokens**

## Token Verification Sources

### 1. **getCurrentUserFromCookies** (`src/lib/getCurrentUser.ts`)
- **Method**: `jwt.verify(token, processedSecret)`
- **Secret Used**: `getProcessedSecret()` - SHA-256 hash, truncated to 32 chars
- **Used By**: Server components, admin pages

### 2. **getCurrentUserFromRequest** (`src/lib/getCurrentUser.ts`)
- **Method**: `jwt.verify(token, processedSecret)`
- **Secret Used**: `getProcessedSecret()` - SHA-256 hash, truncated to 32 chars
- **Used By**: API routes, middleware

## The Fix

### Added `processPayloadSecret()` function (`src/lib/getSecret.ts`)
```typescript
export function processPayloadSecret(rawSecret: string): string {
  // Payload CMS processes the secret: SHA-256 hash, then truncate to 32 chars
  const hash = crypto.createHash('sha256').update(rawSecret).digest('hex')
  return hash.substring(0, 32)
}
```

### Updated verification to use processed secret
- Both `getCurrentUserFromCookies()` and `getCurrentUserFromRequest()` now use `getProcessedSecret()`
- This ensures verification uses the same processed secret that Payload uses for signing

## Verification Checklist

✅ **Token Generation**: Payload uses processed secret (SHA-256 hash, 32 chars)  
✅ **Token Verification**: We now use processed secret (SHA-256 hash, 32 chars)  
✅ **Secret Source**: Both use `process.env.PAYLOAD_SECRET` via `getSecret()`  
✅ **Consistency**: Same processing applied to both signing and verification  

## Testing

After this fix:
1. **Restart dev server** (to load new code)
2. **Clear browser cookies** (old tokens are invalid)
3. **Log in again** (new token will be signed and verified with processed secret)
4. **Check logs** - should see "✅ Token verified successfully"

## Files Changed

- `src/lib/getSecret.ts` - Added `processPayloadSecret()` and `getProcessedSecret()`
- `src/lib/getCurrentUser.ts` - Updated both functions to use `getProcessedSecret()`




