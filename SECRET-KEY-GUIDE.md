# 🔐 PAYLOAD_SECRET Key Management Guide

## Overview

The `PAYLOAD_SECRET` is a critical security key used by Payload CMS to:
- Sign JWT authentication tokens
- Encrypt sensitive data
- Secure admin panel access

## Generating a New Secret Key

You can generate a new secret key using the included script:

```bash
npm run generate:secret
```

This will output a secure 64-character hexadecimal string that you can use as your `PAYLOAD_SECRET`.

## Important Notes

### ✅ Safe to Change
- **Changing the secret key will NOT cause data loss**
- Your database content remains intact
- Collections and documents are unaffected

### ⚠️ What Changes
- All existing user sessions will be invalidated
- Users will need to log in again
- Existing JWT tokens will become invalid

## Setting Up in Vercel

1. **Generate a new secret** (if needed):
   ```bash
   npm run generate:secret
   ```

2. **Add to Vercel Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings** > **Environment Variables**
   - Add a new variable:
     - **Key:** `PAYLOAD_SECRET`
     - **Value:** (paste the generated secret)
     - **Environment:** Select all (Production, Preview, Development)

3. **Redeploy**:
   - After adding the environment variable, you **must redeploy** for it to take effect
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**

## Setting Up Locally

Create a `.env.local` file in the `sarsyc-platform` directory:

```env
PAYLOAD_SECRET=your-generated-secret-key-here
```

## Troubleshooting

### Error: "missing secret key"
- Verify `PAYLOAD_SECRET` is set in Vercel environment variables
- Ensure you've redeployed after adding the variable
- Check that the variable name is exactly `PAYLOAD_SECRET` (case-sensitive)

### Error: "Admin panel blank page"
- Check Vercel deployment logs for detailed error messages
- Verify the secret key is not empty
- Ensure the secret is at least 32 characters long

### Changing the Secret Key
If you need to change the secret key:

1. Generate a new secret: `npm run generate:secret`
2. Update the value in Vercel environment variables
3. Redeploy the application
4. All users will need to log in again (their old sessions will be invalid)

## Best Practices

- ✅ Use different secrets for development and production
- ✅ Keep secrets at least 32 characters long
- ✅ Never commit secrets to Git
- ✅ Use environment variables, never hardcode secrets
- ✅ Rotate secrets periodically for security
- ✅ Store secrets securely (use Vercel's encrypted storage)

## Database Fallback?

**No, we should NOT store the secret in the database.** Here's why:

1. **Security Best Practice**: Secrets should be in environment variables, not in the database
2. **Separation of Concerns**: Secrets are configuration, not data
3. **Performance**: Environment variables are faster to access
4. **Compliance**: Many security standards require secrets in environment variables

If you're having issues with the secret key not being read:
- Check Vercel environment variables are correctly set
- Verify you've redeployed after adding/updating the variable
- Check deployment logs for error messages
- Generate a fresh secret key if the current one might be corrupted



