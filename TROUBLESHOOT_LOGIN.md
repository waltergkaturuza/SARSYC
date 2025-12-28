# Troubleshooting 401 Login Errors

If you're still getting 401 errors after resetting the password, try these steps:

## Step 1: Verify Password Reset

Make sure the password was actually reset. Try the API endpoint again:

```powershell
$body = @{
    email = "admin@sarsyc.org"
    password = "Admin@1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sarsyc.vercel.app/api/admin/reset-password" -Method POST -Body $body -ContentType "application/json"
```

## Step 2: Check for Account Lock

The account might be locked due to too many failed login attempts. The reset script should have cleared this, but if not, you can check:

1. The reset script now clears `login_attempts` and `lock_until` fields
2. Try the API endpoint again - it should reset these fields

## Step 3: Clear Browser Cache and Cookies

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear all cookies for `sarsyc.vercel.app`
4. Clear localStorage
5. Try logging in again

## Step 4: Verify Email and Password

Make sure you're using:
- **Email:** `admin@sarsyc.org` (exact case)
- **Password:** `Admin@1234` (exact case, including the @ symbol)

## Step 5: Check Browser Console

Open browser DevTools (F12) → Console tab and look for:
- Any JavaScript errors
- Network request details
- The exact error message from the API

## Step 6: Try Direct Database Reset

If the API isn't working, use the direct database script with production DATABASE_URL:

```powershell
# Get DATABASE_URL from Vercel → Settings → Environment Variables
$env:DATABASE_URL = "your-production-database-url"
$env:ADMIN_EMAIL = "admin@sarsyc.org"

cd C:\Users\Administrator\Documents\SARSYC\sarsyc-platform
node scripts/reset_password_direct.mjs "Admin@1234"

# Clear the env var after
Remove-Item Env:\DATABASE_URL
```

## Step 7: Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to Deployments → Latest deployment → Functions
4. Check the logs for `/api/auth/login` to see the exact error

## Common Issues:

1. **Password hash mismatch** - Fixed in the updated script (uses empty salt)
2. **Account locked** - Reset script now clears lock status
3. **Cached credentials** - Clear browser cache/cookies
4. **Wrong email/password** - Double-check exact spelling
5. **API not deployed** - Wait for Vercel deployment to complete


