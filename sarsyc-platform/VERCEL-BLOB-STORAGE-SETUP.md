# Vercel Blob Storage Setup Guide

## Why This Is Needed

The platform uses Vercel Blob Storage for file uploads (passport scans, abstract files, speaker photos, partner logos, etc.). Without this token, file uploads will fail in production.

## Steps to Add BLOB_READ_WRITE_TOKEN in Vercel

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your `sarsyc` project

### 2. Navigate to Environment Variables
- Click on your project
- Click **"Settings"** tab (top menu)
- Click **"Environment Variables"** (left sidebar)

### 3. Add BLOB_READ_WRITE_TOKEN
- Click **"Add New"** button
- **Key:** `BLOB_READ_WRITE_TOKEN`
- **Value:** `vercel_blob_rw_I27XTi3L8IoQ07MK_qxde4QTkuG77CO81m50YWLsgYARdwb`
- **Environment:** Select **ALL** (Production, Preview, Development)
- Click **"Save"**

### 4. Redeploy Your Application
After saving the environment variable, you MUST redeploy:

**Option A: Manual Redeploy**
- Go to **"Deployments"** tab
- Click the **"..."** menu (three dots) on the latest deployment
- Click **"Redeploy"**
- Wait 1-2 minutes for deployment to complete

**Option B: Trigger Auto-Deploy**
- Make a small change (like adding a comment) to any file
- Commit and push to GitHub
- Vercel will automatically redeploy with the new environment variable

### 5. Verify It's Working
After redeployment:
1. Try uploading a file (e.g., passport scan in registration form)
2. Check Vercel logs - you should NOT see the storage adapter warning anymore
3. Files should upload successfully

## What This Token Enables

✅ **Registration Form** - Passport scan uploads  
✅ **Abstract Submission** - Abstract file uploads (admin)  
✅ **Resources** - Resource file uploads  
✅ **News Articles** - Featured image uploads  
✅ **Speakers** - Speaker photo uploads  
✅ **Partners** - Partner logo uploads  

## Security Notes

⚠️ **IMPORTANT:**
- This token is **sensitive** - do NOT commit it to Git
- The token is already provided above, just add it to Vercel
- If the token is ever compromised, regenerate it in Vercel Blob Storage settings

## Troubleshooting

**If file uploads still fail after adding the token:**
1. Verify the token is added correctly (no extra spaces)
2. Ensure you redeployed after adding the token
3. Check Vercel logs for any errors
4. Verify the token is enabled for all environments (Production, Preview, Development)

## Local Development

For local development, you can optionally add this to your `.env` file:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_I27XTi3L8IoQ07MK_qxde4QTkuG77CO81m50YWLsgYARdwb
```

**Note:** Local development will work without this token (uses local file storage), but adding it ensures consistent behavior between local and production.

