# SQL Script: Create Youth Steering Committee Table

## Quick Start

**File:** `scripts/create_youth_steering_committee_table.sql`

This SQL script creates the database table for the Youth Steering Committee collection. Use this if the Payload CMS migration hasn't run automatically.

---

## How to Run on Neon Database

### Option 1: Neon Console (Recommended)

1. **Open Neon Console**
   - Go to: https://console.neon.tech
   - Sign in to your account

2. **Select Your Project**
   - Choose the project containing your SARSYC database

3. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Or navigate to: `Your Project → SQL Editor`

4. **Run the Script**
   - Open the file: `scripts/create_youth_steering_committee_table.sql`
   - Copy the entire contents
   - Paste into the SQL editor
   - Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

5. **Verify Success**
   - You should see: `Table created successfully!`
   - The script will also show the table structure

---

### Option 2: Using psql Command Line

```bash
# Connect to Neon database
psql "postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Run the SQL script
\i scripts/create_youth_steering_committee_table.sql
```

---

### Option 3: Using Node.js Script

```bash
# From project root
node scripts/run_youth_steering_committee_sql.mjs
```

---

## What This Script Does

1. **Creates Table:** `youth_steering_committee`
   - All required fields (name, role, organization, country, bio, etc.)
   - Optional fields (email, photo, social media)
   - Timestamps (created_at, updated_at)

2. **Creates Indexes:**
   - Photo relationship index
   - Featured flag index (for filtering)
   - Order index (for sorting)
   - Country index (for filtering)
   - Created_at index (for sorting)

3. **Adds Foreign Keys:**
   - Photo → media table relationship
   - Document locking relationships

4. **Verification:**
   - Shows table creation status
   - Displays table structure

---

## Verification After Running

### Check Table Exists

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'youth_steering_committee';
```

### Check Table Structure

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'youth_steering_committee'
ORDER BY ordinal_position;
```

### Check Indexes

```sql
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'youth_steering_committee';
```

---

## Troubleshooting

### Error: "relation already exists"
- **Meaning:** Table already exists (migration already ran)
- **Solution:** This is fine! The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Error: "relation 'media' does not exist"
- **Meaning:** The media table hasn't been created yet
- **Solution:** Run Payload CMS migrations first, or create the media table.

### Error: "permission denied"
- **Meaning:** Database user doesn't have CREATE TABLE permission
- **Solution:** Use a database user with admin/owner privileges.

---

## After Running the Script

1. **Refresh Admin Panel**
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

2. **Test Creating a Member**
   - Go to: `/admin/youth-steering-committee`
   - Click "Add Member"
   - Fill in the form and submit

3. **Verify in Database**
   ```sql
   SELECT * FROM youth_steering_committee;
   ```

---

## Rollback (If Needed)

⚠️ **WARNING:** This will delete all Youth Steering Committee data!

```sql
-- Drop foreign key constraints first
ALTER TABLE "payload_locked_documents_rels" 
  DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_youth_steering_committee_fk";

ALTER TABLE "youth_steering_committee" 
  DROP CONSTRAINT IF EXISTS "youth_steering_committee_photo_fkey";

-- Drop indexes
DROP INDEX IF EXISTS "payload_locked_documents_rels_youth_steering_committee_id_idx";
DROP INDEX IF EXISTS "youth_steering_committee_created_at_idx";
DROP INDEX IF EXISTS "youth_steering_committee_country_idx";
DROP INDEX IF EXISTS "youth_steering_committee_order_idx";
DROP INDEX IF EXISTS "youth_steering_committee_featured_idx";
DROP INDEX IF EXISTS "youth_steering_committee_photo_idx";

-- Drop column from payload_locked_documents_rels
ALTER TABLE "payload_locked_documents_rels" 
  DROP COLUMN IF EXISTS "youth_steering_committee_id";

-- Drop the table
DROP TABLE IF EXISTS "youth_steering_committee" CASCADE;
```

---

**Last Updated:** February 2, 2025  
**Status:** Ready to use
