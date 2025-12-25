# Testing Admin Panel Locally

## Quick Test Steps

1. **Ensure .env.local exists with PAYLOAD_SECRET:**
   ```bash
   # In sarsyc-platform folder
   echo "PAYLOAD_SECRET=test-secret-key-for-local-development-only-12345" >> .env.local
   echo "DATABASE_URL=your-database-url" >> .env.local
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Visit admin panel:**
   - Open: http://localhost:3000/admin
   - Should load Payload admin login

4. **Check for errors:**
   - Open browser console (F12)
   - Check terminal for any errors
   - Look for "missing secret key" errors

## If You See Secret Key Error

The error `"missing secret key. A secret key is needed to secure Payload"` means:

1. **Check .env.local file exists** and has `PAYLOAD_SECRET`
2. **Restart dev server** after adding env vars
3. **Check terminal** - should show secret is loaded (or warning if missing)

## Current Fix

The code now:
- Gets secret from `process.env.PAYLOAD_SECRET`
- Passes it to `buildConfig()` via config
- Also passes it explicitly to `payload.init()`
- Has fallback for development: `changeme-local-dev-only`

## Production

In Vercel/production:
- Set `PAYLOAD_SECRET` in environment variables
- Must be a strong random string (32+ characters)
- Code will throw error if missing in production

