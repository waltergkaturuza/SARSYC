# Fix for Migration Error on Windows

There's a known issue with Payload CMS migrations on Windows due to ESM path handling. The error `ERR_UNSUPPORTED_ESM_URL_SCHEME` occurs when Payload tries to dynamically load migration files.

## Workaround: Apply Migrations Manually

Since the migrations are already generated, you can apply them manually using SQL or by using the migration SQL files.

### Option 1: Apply SQL Directly (Recommended)

You can apply the migrations by running the SQL statements directly in your database:

1. Connect to your PostgreSQL database (Neon or local)
2. Run the SQL from the migration files in order:
   - First migration: `20251226_155456_add_international_registration_fields.ts` 
   - Second migration: `20251226_160419_add_passport_scan_nextofkin_enhancements.ts`

### Option 2: Use Migration Script

There's a script at `scripts/apply_migration.mjs` that can be used to apply migrations manually.

### Option 3: Apply via Vercel/Production

When deploying to Vercel (Linux environment), the migration command should work correctly:
```bash
npm run payload migrate
```

### Option 4: Wait for Payload Fix

This is a known issue with Payload CMS on Windows. You can:
- Monitor the Payload CMS GitHub for fixes
- Use WSL (Windows Subsystem for Linux) to run migrations
- Apply migrations only in production/staging environments

## Current Migration Files

The following migrations need to be applied:
1. `20251226_155456_add_international_registration_fields` - Adds DOB, gender, nationality, address, etc.
2. `20251226_160419_add_passport_scan_nextofkin_enhancements` - Adds passport scan, enhanced next of kin fields, travel insurance

Both migrations are safe to run and are additive (they only add new columns).


