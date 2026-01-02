# Quick Password Reset for Production

## ⚡ Fastest Method: Use Production Database Directly

Since the API endpoint needs to be deployed first, you can reset the password directly using the production database:

### Step 1: Get Production DATABASE_URL from Vercel

1. Go to https://vercel.com
2. Select your project (sarsyc)
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` and copy its value

### Step 2: Run the Reset Script

Open PowerShell and run:

```powershell
# Set production database (replace with your actual DATABASE_URL from Vercel)
$env:DATABASE_URL = "postgresql://user:password@host.neon.tech/dbname?sslmode=require"
$env:ADMIN_EMAIL = "admin@sarsyc.org"

# Reset password
cd C:\Users\Administrator\Documents\SARSYC\sarsyc-platform
node scripts/reset_password_direct.mjs "Admin@1234"
```

### Step 3: Clear Environment Variable

After resetting, clear it to avoid accidental production connections:

```powershell
Remove-Item Env:\DATABASE_URL
```

### Step 4: Test Login

Go to https://sarsyc.vercel.app/login and try:
- Email: `admin@sarsyc.org`
- Password: `Admin@1234`

---

## Alternative: Wait for API Endpoint Deployment

After pushing the code, Vercel will automatically deploy. Once deployed (usually 2-3 minutes), you can use:

```powershell
$body = @{
    email = "admin@sarsyc.org"
    password = "Admin@1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sarsyc.vercel.app/api/admin/reset-password" -Method POST -Body $body -ContentType "application/json"
```

---

## ⚠️ Security Note

After resetting and confirming login works:
1. **Remove or secure the reset endpoint** at `src/app/api/admin/reset-password/route.ts`
2. Change the password to something more secure through the admin panel
3. Consider implementing a proper password reset flow




