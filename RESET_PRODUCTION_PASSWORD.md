# Reset Admin Password in Production (Vercel)

## Method 1: Using the API Endpoint (Easiest)

The production site has a password reset endpoint. You can use it to reset the password directly in production.

### Step 1: Call the Reset Endpoint

Use curl, Postman, or PowerShell to call the endpoint:

**PowerShell:**
```powershell
$body = @{
    email = "admin@sarsyc.org"
    password = "Admin@1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sarsyc.vercel.app/api/admin/reset-password" -Method POST -Body $body -ContentType "application/json"
```

**curl (if available):**
```bash
curl -X POST https://sarsyc.vercel.app/api/admin/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sarsyc.org","password":"Admin@1234"}'
```

### Step 2: Try Logging In

After resetting, try logging in with:
- Email: `admin@sarsyc.org`
- Password: `Admin@1234`

## Method 2: Using the Script with Production Database

If Method 1 doesn't work, you can run the script locally but connect to the production database.

### Step 1: Get Your Production DATABASE_URL

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Copy the `DATABASE_URL` value

### Step 2: Run the Script

```powershell
# Set production database URL temporarily
$env:DATABASE_URL = "your-production-database-url-here"
$env:ADMIN_EMAIL = "admin@sarsyc.org"

# Run the reset script
node scripts/reset_password_direct.mjs "Admin@1234"
```

**⚠️ Important:** Make sure to clear the DATABASE_URL from your environment after running the script to avoid accidentally connecting to production in the future.

## Method 3: Using Vercel CLI (If Installed)

If you have Vercel CLI installed, you can run:

```bash
vercel env pull .env.production
# Then run the script with production env
DATABASE_URL=$(grep DATABASE_URL .env.production) node scripts/reset_password_direct.mjs "Admin@1234"
```

## Troubleshooting

### If API endpoint returns 500 error:
- The endpoint might need the server to be running
- Try Method 2 instead (direct database connection)

### If script can't connect:
- Verify DATABASE_URL is correct
- Check if your IP is allowed (if database has IP restrictions)
- Ensure SSL is enabled in connection string

### After resetting:
1. **Remove or secure the reset endpoint** - It's currently open for emergency use
2. Change the password to something more secure after logging in
3. Consider setting up proper password reset flow for future use




