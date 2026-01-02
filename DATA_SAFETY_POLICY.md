# Data Safety Policy

## ⚠️ CRITICAL: Production Data Protection

**This document outlines policies to prevent data loss when rolling out to tenants.**

---

## 🚨 Never Run These Operations in Production

### 1. **Migration Rollbacks (down() functions)**
- **NEVER** run `payload migrate:down` in production
- Down migrations DROP entire tables and will DELETE ALL DATA
- Only use `payload migrate` (up migrations) in production

### 2. **Destructive Scripts**
The following scripts will DELETE data and should NEVER be run in production:

- ❌ `scripts/delete_all_registrations.mjs` - Deletes all registrations
- ❌ `scripts/delete_all_registrations_force.mjs` - Force deletes all registrations
- ❌ `scripts/drop_document_locking_tables.mjs` - Drops tables (safe, but be cautious)
- ❌ `scripts/cleanup_orphaned_speaker_photos.mjs` - Deletes media files

### 3. **Dangerous Migration Down Functions**

These migrations have destructive `down()` functions that DROP entire tables:

- ⚠️ `20251223_130213.ts` - Drops ALL tables (users, registrations, abstracts, speakers, etc.)
- ⚠️ `20251226_155456_add_international_registration_fields.ts` - Drops participants table
- ⚠️ `20251227_113630_create_sponsorship_tiers.ts` - Drops sponsorship_tiers table

**These down() functions are ONLY for development/testing. NEVER run them in production.**

---

## ✅ Safe Operations

### Safe Migration Operations
- ✅ `payload migrate` - Runs up() migrations (safe, adds/modifies tables)
- ✅ `payload migrate:status` - Check migration status (read-only)
- ✅ Adding new columns with `ALTER TABLE ADD COLUMN`
- ✅ Creating new tables
- ✅ Adding indexes

### Safe Scripts
- ✅ `scripts/check_admin_user.mjs` - Read-only check
- ✅ `scripts/unlock_admin.mjs` - Only updates lock status
- ✅ `scripts/reset_password_direct.mjs` - Only updates password hash
- ✅ `scripts/test_admin_login.mjs` - Read-only test

---

## 📋 Pre-Production Checklist

Before deploying to production or rolling out to tenants:

1. **✅ Backup Database**
   ```bash
   # Create a full database backup
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **✅ Review All Migrations**
   - Check that only `up()` functions will run
   - Verify no DROP TABLE statements in up() functions
   - Ensure migrations are idempotent (safe to run multiple times)

3. **✅ Test Migrations Locally**
   ```bash
   # Test migrations on a copy of production data
   payload migrate
   ```

4. **✅ Verify No Destructive Scripts in Deployment**
   - Check that deployment scripts don't call delete/drop scripts
   - Ensure CI/CD pipelines don't run destructive operations

5. **✅ Document Changes**
   - Document all schema changes
   - Note any data migrations required
   - Plan rollback strategy (if needed)

---

## 🔒 Migration Safety Rules

### Rule 1: Up Migrations Must Be Safe
All `up()` functions should:
- ✅ Use `IF NOT EXISTS` for table creation
- ✅ Use `IF EXISTS` for dropping (only if absolutely necessary)
- ✅ Never DROP tables with data
- ✅ Use `ALTER TABLE ADD COLUMN IF NOT EXISTS` for new columns
- ✅ Be idempotent (safe to run multiple times)

### Rule 2: Down Migrations Are Forbidden in Production
- ❌ Never run `payload migrate:down` in production
- ❌ Down migrations are ONLY for development/testing
- ✅ If rollback is needed, create a new migration to fix issues

### Rule 3: Data Migrations Must Preserve Data
- ✅ When changing column types, preserve existing data
- ✅ When renaming columns, use `ALTER TABLE RENAME COLUMN` (preserves data)
- ✅ When adding required fields, provide default values

---

## 🛡️ Safeguards Implemented

### 1. Migration Warnings
All dangerous migrations have warnings in their `down()` functions.

### 2. Script Confirmations
Destructive scripts require explicit confirmation:
- `delete_all_registrations.mjs` - Requires typing "yes"
- `delete_all_registrations_force.mjs` - No confirmation (use with extreme caution)

### 3. Environment Checks
Consider adding environment checks to prevent destructive operations in production:

```typescript
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  throw new Error('This operation is not allowed in production')
}
```

---

## 📦 Backup Strategy

### Before Every Deployment:
1. **Full Database Backup**
   ```bash
   pg_dump $DATABASE_URL > backups/backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Verify Backup**
   ```bash
   # Check backup file size (should be > 0)
   ls -lh backups/backup_*.sql
   ```

3. **Store Backup Securely**
   - Store in cloud storage (S3, Google Cloud Storage, etc.)
   - Keep multiple versions (last 7 days)
   - Test restore procedure regularly

### Automated Backups
Set up automated daily backups:
- Use database provider's backup service (if available)
- Or use cron job with pg_dump
- Store backups in separate location from database

---

## 🚨 Emergency Procedures

### If Data Loss Occurs:

1. **STOP** all operations immediately
2. **DO NOT** run any more migrations
3. **RESTORE** from most recent backup
4. **INVESTIGATE** what caused the data loss
5. **DOCUMENT** the incident and fix

### Recovery Steps:
```bash
# 1. Stop the application
# 2. Restore from backup
psql $DATABASE_URL < backups/backup_YYYYMMDD_HHMMSS.sql

# 3. Verify data
# 4. Restart application
```

---

## ✅ Migration Review Process

Before creating a new migration:

1. **Review the migration file**
   - Check for DROP TABLE statements
   - Verify data preservation
   - Ensure idempotency

2. **Test locally**
   - Run on test database
   - Verify no data loss
   - Test rollback (if needed)

3. **Get approval**
   - Code review required
   - Document any risks
   - Plan for rollback

4. **Deploy carefully**
   - Deploy during low-traffic period
   - Monitor for errors
   - Have backup ready

---

## 📝 Current Safe Migrations

These migrations are safe and can be run in production:

- ✅ `20250128_000000_add_user_account_fields.ts` - Adds columns (safe)
- ✅ `20250128_000001_create_audit_logs.ts` - Creates new table (safe)
- ✅ `20250101_000000_drop_document_locking_tables.ts` - Drops unused tables (safe, but verify)

---

## 🔍 How to Check Migration Safety

### Check if a migration is safe:
```bash
# Read the migration file
cat src/migrations/[migration_name].ts

# Look for:
# ✅ Safe: CREATE TABLE IF NOT EXISTS, ALTER TABLE ADD COLUMN
# ⚠️  Risky: DROP TABLE, TRUNCATE, DELETE FROM
# ❌ Dangerous: DROP TABLE in up() function
```

### Verify migration status:
```bash
# Check which migrations have run
payload migrate:status

# This shows which migrations are pending
```

---

## 📞 Support

If you're unsure about a migration or operation:
1. **STOP** and ask for review
2. **TEST** in development first
3. **BACKUP** before proceeding
4. **DOCUMENT** all changes

---

**Last Updated:** 2025-01-28
**Status:** Active Policy for Production Deployment

