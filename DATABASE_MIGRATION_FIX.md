# 🔧 Database Migration Fix - Sponsorship Tiers

**Issue:** The `sponsorship_tiers` table doesn't exist in production, causing errors when accessing `/admin/sponsorship-tiers`.

**Error:** `Failed query: select count(*) from "sponsorship_tiers"`

---

## ✅ **Solution: Apply Migration**

The migration file has been created. You need to apply it to your production database.

### **Option 1: Run Migration via Payload (Recommended for Vercel)**

If you have access to Vercel's deployment environment, the migration should run automatically on the next deployment. However, you can also trigger it manually:

1. **Via Vercel CLI:**
   ```bash
   vercel env pull .env.local
   npm run payload migrate
   ```

2. **Or wait for next deployment** - Payload will attempt to run migrations automatically.

### **Option 2: Apply SQL Directly (Quick Fix)**

Connect to your production database and run the SQL script:

1. **Get your database connection string** from Vercel environment variables (`DATABASE_URL`)

2. **Connect to PostgreSQL** (using psql, pgAdmin, or your database provider's console)

3. **Run the SQL script:**
   ```sql
   -- Copy and paste the contents of:
   -- scripts/create_sponsorship_tiers_table.sql
   ```

   Or run it directly:
   ```bash
   psql $DATABASE_URL -f scripts/create_sponsorship_tiers_table.sql
   ```

### **Option 3: Use Migration Script**

If you have the migration script set up:

```bash
node scripts/apply_migration.mjs
```

---

## 📋 **What the Migration Creates:**

1. **`sponsorship_tiers` table** - Main table with:
   - `id` (serial primary key)
   - `name` (varchar)
   - `price` (varchar)
   - `order` (numeric)
   - `is_active` (boolean)
   - `is_popular` (boolean)
   - `icon` (varchar)
   - `color` (varchar)
   - `description` (varchar)
   - `created_at`, `updated_at` (timestamps)

2. **`sponsorship_tiers_benefits` table** - Array table for benefits:
   - `_order` (integer)
   - `_parent_id` (integer, foreign key)
   - `id` (varchar primary key)
   - `benefit` (varchar)

3. **Indexes** for performance:
   - Order index
   - Active status index
   - Timestamp indexes
   - Benefits relationship indexes

4. **Foreign keys** for data integrity

---

## 🚀 **After Migration:**

Once the migration is applied:

1. ✅ The `/admin/sponsorship-tiers` page will work
2. ✅ You can create tiers through Payload admin
3. ✅ The `/partnerships` page will display tiers dynamically
4. ✅ The API endpoint `/api/sponsorship-tiers` will work

---

## ⚠️ **Important Notes:**

- The migration uses `IF NOT EXISTS` so it's safe to run multiple times
- All constraints use `IF NOT EXISTS` for idempotency
- The migration is reversible (has a `down` function)

---

## 📝 **Files Created:**

1. `src/migrations/20251227_113630_create_sponsorship_tiers.ts` - TypeScript migration
2. `scripts/create_sponsorship_tiers_table.sql` - SQL script for direct execution
3. Updated `src/migrations/index.ts` - Added migration to index

---

**After applying the migration, the error will be resolved!** ✅



