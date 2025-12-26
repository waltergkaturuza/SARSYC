# 🔐 Database Fallback for PAYLOAD_SECRET

## Overview

The system now supports **database fallback** for the `PAYLOAD_SECRET`. If the environment variable is not set, the system will automatically retrieve the secret from the database.

## How It Works

1. **First**: System checks for `PAYLOAD_SECRET` environment variable
2. **Fallback**: If not found, queries the `app_secrets` table in the database
3. **Development**: If neither is available and in development mode, uses a default secret

## Setup Instructions

### Step 1: Initialize Secret in Database

Run the initialization script to create the table and store a secret:

```bash
npm run init:secret
```

This will:
- Create the `app_secrets` table (if it doesn't exist)
- Generate a new secure secret key
- Store it in the database with key `payload_secret`

### Step 2: Or Use a Custom Secret

If you already have a secret key (e.g., from `npm run generate:secret`), you can use it:

```bash
npm run init:secret your-secret-key-here
```

### Step 3: Verify Setup

The script will output confirmation that the secret was stored. You should see:

```
✅ Stored PAYLOAD_SECRET in database
🔐 Secret stored in database:
   Key: payload_secret
   Value: [your-secret]
```

## Database Schema

The `app_secrets` table has the following structure:

```sql
CREATE TABLE app_secrets (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Usage Priority

The system checks for the secret in this order:

1. **Environment Variable** (`PAYLOAD_SECRET`) - **Highest Priority**
2. **Database** (`app_secrets` table, key: `payload_secret`) - **Fallback**
3. **Default** (`changeme-local-dev-only`) - **Development Only**

## When to Use Database Fallback

Database fallback is useful when:
- Environment variables are difficult to configure (e.g., some deployment platforms)
- You need a backup method if environment variables fail
- You're managing secrets through database-based configuration

## Security Considerations

⚠️ **Important Security Notes:**

1. **Database Access**: The secret is stored in plain text in the database. Ensure:
   - Database connections are encrypted (SSL/TLS)
   - Database access is restricted
   - Regular security audits are performed

2. **Environment Variables Preferred**: Environment variables are still the recommended approach because:
   - They don't require database access to retrieve
   - They're easier to rotate
   - They follow security best practices

3. **Secret Rotation**: If you change the secret:
   - Update it in the database: `npm run init:secret new-secret-key`
   - Or update the environment variable
   - All users will need to log in again

## Troubleshooting

### Error: "app_secrets table does not exist"
Run the initialization script:
```bash
npm run init:secret
```

### Error: "DATABASE_URL not set"
Ensure `DATABASE_URL` is set in your environment variables. The database fallback requires database access.

### Secret Not Loading
1. Check database connection is working
2. Verify the secret exists in the table:
   ```sql
   SELECT * FROM app_secrets WHERE key = 'payload_secret';
   ```
3. Check application logs for error messages

## Vercel Deployment

For Vercel deployments:

1. **Option 1 (Recommended)**: Use environment variables
   - Set `PAYLOAD_SECRET` in Vercel environment variables
   - Redeploy

2. **Option 2**: Use database fallback
   - Ensure `DATABASE_URL` is set in Vercel
   - Run `npm run init:secret` locally (connects to your Vercel database)
   - Or run it after deployment via a script/function

## Updating the Secret

To update the secret in the database:

```bash
npm run init:secret your-new-secret-key
```

The script will update the existing record if one exists.

## Migration Notes

If you're migrating from environment variable-only setup:
1. The system will continue to prefer environment variables
2. Database fallback is automatically used if env var is missing
3. No changes needed to existing deployments that have `PAYLOAD_SECRET` set


