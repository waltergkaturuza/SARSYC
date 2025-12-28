# Disabling Payload CMS Document Locking

## Problem

You're seeing errors like:
```
Failed query: select distinct "payload_locked_documents"."id"...
```

This happens because Payload CMS's document locking feature is enabled by default, but it doesn't work well in serverless environments (like Vercel) and causes database query errors.

## Solution

We've disabled document locking in the Payload config (`maxConcurrentEditing: 0`), but the database tables still exist and Payload continues to query them.

### Step 1: Drop the Document Locking Tables

You have two options:

#### Option A: Using the Node.js Script (Recommended)

```bash
npm run drop:locking-tables
```

This script will:
- Connect to your database using `DATABASE_URL`
- Check if the locking tables exist
- Drop `payload_locked_documents_rels` (relationship table)
- Drop `payload_locked_documents` (main table)
- Verify the tables are removed

**Requirements:**
- `DATABASE_URL` environment variable must be set
- Node.js script uses `pg` package (already in dependencies)

#### Option B: Using SQL Directly

If you prefer to run SQL directly, use the SQL script:

```bash
# Connect to your database and run:
psql $DATABASE_URL -f scripts/drop_document_locking_tables.sql
```

Or manually execute:
```sql
DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;
DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;
```

### Step 2: Verify Tables Are Dropped

After running the script, verify the tables are gone:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'payload_locked%';
```

This should return no rows.

### Step 3: Redeploy

After dropping the tables, redeploy your application. The document locking errors should stop.

## Configuration

Document locking is already disabled in `src/payload/payload.config.ts`:

```typescript
admin: {
  // ...
  maxConcurrentEditing: 0, // Disables document locking
},
```

## Why This Happens

1. Payload CMS creates `payload_locked_documents` tables by default
2. Even with `maxConcurrentEditing: 0`, Payload may still query these tables
3. In serverless environments, these queries can fail or cause errors
4. The solution is to drop the tables entirely

## Safety

- ✅ Safe to drop these tables if `maxConcurrentEditing: 0` is set
- ✅ No data loss - these tables only track document locks
- ✅ Won't affect your actual content (speakers, abstracts, etc.)
- ✅ The script uses `DROP TABLE IF EXISTS` so it's safe to run multiple times

## Troubleshooting

### Error: "DATABASE_URL is required"
- Set the `DATABASE_URL` environment variable before running the script
- For local: `export DATABASE_URL="your-connection-string"`
- For production: Ensure it's set in your deployment environment

### Error: "Cannot connect to database"
- Check your `DATABASE_URL` is correct
- Verify database is accessible from your network
- Check SSL settings if using a cloud database

### Tables still exist after running script
- Check the script output for any errors
- Verify you're connected to the correct database
- Try running the SQL directly

## Related Files

- `scripts/drop_document_locking_tables.mjs` - Node.js script to drop tables
- `scripts/drop_document_locking_tables.sql` - SQL script
- `src/payload/payload.config.ts` - Payload configuration with `maxConcurrentEditing: 0`

