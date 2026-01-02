# Reset Admin Password

## Method 1: Using the API Endpoint (Recommended)

1. Make sure your development server is running:
   ```powershell
   npm run dev
   ```

2. Use curl or any HTTP client to call the reset endpoint:
   ```powershell
   # Using PowerShell
   $body = @{
       email = "admin@sarsyc.org"
       password = "Admin@1234"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:3000/api/admin/reset-password" -Method POST -Body $body -ContentType "application/json"
   ```

   Or using curl (if available):
   ```bash
   curl -X POST http://localhost:3000/api/admin/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sarsyc.org","password":"Admin@1234"}'
   ```

3. You should see a success response:
   ```json
   {
     "success": true,
     "message": "Password successfully reset for admin@sarsyc.org"
   }
   ```

4. **IMPORTANT**: After resetting, remove or secure the `/api/admin/reset-password` endpoint!

## Method 2: Using the Script

1. Set environment variables:
   ```powershell
   $env:ADMIN_EMAIL = "admin@sarsyc.org"
   $env:ADMIN_PASSWORD = "Admin@1234"
   ```

2. Run the script:
   ```powershell
   npm run payload -- run scripts/reset_admin_password.mjs
   ```

## Method 3: Direct Database Update (Advanced)

If both methods fail, you can update the password directly in the database using SQL, but you'll need to hash it first using bcrypt.

## Security Note

⚠️ **The API endpoint is intentionally open for emergency use. Please remove or secure it after resetting your password!**

To secure it later, uncomment the token check in `src/app/api/admin/reset-password/route.ts` and set `PASSWORD_RESET_TOKEN` in your environment variables.




