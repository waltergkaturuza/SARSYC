# Fix Resource Types Database Error

## Problem
The database enum `enum_resources_type` doesn't include the new resource types, causing this error:
```
invalid input value for enum enum_resources_type: "research-report"
```

## Solution

### Option 1: Run SQL Directly (Immediate Fix)

Connect to your PostgreSQL database and run:

```sql
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'abstract';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'concept-note';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'research-report';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'symposium-report';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'communique';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'declaration';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'template';
```

**How to run:**
1. Go to your database provider (Vercel Postgres, Neon, Supabase, etc.)
2. Open the SQL query editor
3. Copy and paste the SQL above
4. Execute

### Option 2: Run Migration Script

```bash
node scripts/run_resource_types_migration.mjs
```

This requires `DATABASE_URL` in your `.env` file pointing to your database.

### Option 3: Wait for Auto-Migration

The migration will run automatically on next Vercel deployment.

## Verify

After running, you can verify with:

```sql
SELECT unnest(enum_range(NULL::enum_resources_type)) AS resource_type;
```

This should show all 15 resource types.

## Files Changed

- ✅ `src/migrations/20250122_000000_add_resource_types.ts` - Payload migration
- ✅ `scripts/add_resource_types.sql` - Standalone SQL
- ✅ `scripts/run_resource_types_migration.mjs` - Migration runner

All pushed to GitHub (commit `d3e80bd`)
