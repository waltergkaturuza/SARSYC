# Run Resource Types Migration on Neon Database

## Quick Start

```bash
node scripts/neon_add_resource_types.mjs
```

This will add all new resource types to your Neon PostgreSQL database.

## Prerequisites

1. **DATABASE_URL in .env file**
   ```env
   DATABASE_URL=postgresql://user:password@ep-xxxx-xxxx.region.aws.neon.tech/database?sslmode=require
   ```

2. **Node.js** installed (already have it)

3. **Dependencies** installed:
   ```bash
   npm install
   ```

## What It Does

Adds these resource types to your database:
- ✅ abstract
- ✅ concept-note
- ✅ research-report
- ✅ symposium-report
- ✅ communique
- ✅ declaration
- ✅ template

## Expected Output

```
🔄 Connecting to Neon database...

📝 Adding new resource type enum values...

✅ Added: abstract
✅ Added: concept-note
✅ Added: research-report
✅ Added: symposium-report
✅ Added: communique
✅ Added: declaration
✅ Added: template

📋 Verifying all resource types in database...

Current resource types:
  1. abstract
  2. brief
  3. communique
  4. concept-note
  5. declaration
  6. infographic
  7. other
  8. paper
  9. presentation
  10. report
  11. research-report
  12. symposium-report
  13. template
  14. toolkit
  15. video

✅ SUCCESS! Total resource types: 15

🎉 You can now create resources with all types!
```

## Alternative: Run SQL Manually

If the script doesn't work, you can run this SQL directly in Neon's SQL Editor:

```sql
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'abstract';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'concept-note';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'research-report';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'symposium-report';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'communique';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'declaration';
ALTER TYPE "enum_resources_type" ADD VALUE IF NOT EXISTS 'template';

-- Verify
SELECT unnest(enum_range(NULL::enum_resources_type)) AS resource_type
ORDER BY resource_type;
```

### How to Access Neon SQL Editor:

1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Paste the SQL above
5. Click "Run"

## Troubleshooting

### Error: DATABASE_URL not found
- Make sure you have a `.env` file in the project root
- Add `DATABASE_URL=your_neon_connection_string`

### Error: Connection timeout
- Check your Neon database is running
- Verify the DATABASE_URL is correct
- Make sure you're not behind a firewall blocking database connections

### Error: permission denied
- Make sure your Neon user has ALTER TABLE permissions
- You may need to use the admin/owner account

## After Running

1. Restart your dev server: `npm run dev`
2. Clear browser cache
3. Try creating a resource in the admin panel
4. All 15 types should now be available!
