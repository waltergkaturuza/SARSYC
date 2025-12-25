# How to Add PAYLOAD_SECRET in Vercel

## Steps to Fix Admin Panel Error

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your `sarsyc` project

2. **Navigate to Settings:**
   - Click on your project
   - Click **"Settings"** tab (top menu)
   - Click **"Environment Variables"** (left sidebar)

3. **Add PAYLOAD_SECRET:**
   - Click **"Add New"** button
   - **Key:** `PAYLOAD_SECRET`
   - **Value:** Generate a strong random string (32+ characters)
     - You can use: https://randomkeygen.com/
     - Or run: `openssl rand -base64 32` in terminal
   - **Environment:** Select ALL (Production, Preview, Development)
   - Click **"Save"**

4. **Redeploy:**
   - After saving, go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - OR: Make a small change and push to GitHub (triggers auto-deploy)

5. **Test:**
   - Wait 1-2 minutes for redeploy
   - Visit: https://sarsyc.vercel.app/admin
   - Should now load Payload admin login page

## Quick Secret Generator

If you need a secret key, use one of these methods:

**Option 1: Online Generator**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" or "Fort Knox Passwords"
- Copy a 64-character string

**Option 2: Terminal/Command Line**
```bash
# PowerShell (Windows)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Manual**
Just type a long random string like:
```
sarsyc-2026-production-secret-key-change-this-to-something-random-123456789
```

## Important Notes

- ⚠️ **DO NOT** commit the secret to Git
- ✅ The secret should be 32+ characters long
- ✅ Use different secrets for different environments if needed
- ✅ After adding, you MUST redeploy for changes to take effect

## Other Required Environment Variables

While you're in Vercel settings, also ensure these are set:

- ✅ `DATABASE_URL` - Your Neon PostgreSQL connection string
- ✅ `PAYLOAD_SECRET` - **This is what's missing!**
- ✅ `PAYLOAD_PUBLIC_SERVER_URL` - Should be `https://sarsyc.vercel.app`
- ✅ `NEXT_PUBLIC_SERVER_URL` - Should be `https://sarsyc.vercel.app`

## After Adding PAYLOAD_SECRET

Once you add the secret and redeploy:
1. Admin panel will load correctly
2. You can create your first admin user
3. Start adding content to your site!

