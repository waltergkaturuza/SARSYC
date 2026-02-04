# Authentication Fix Summary

## 🔍 Root Cause Identified

Authentication started failing after adding the **Abstract Reviewers** feature because:

1. **AdminLayout.tsx** was modified to check user roles and filter navigation for reviewers
2. This requires calling `/api/user/profile` on every admin page load
3. `/api/user/profile` calls `getCurrentUserFromCookies()` 
4. `getCurrentUserFromCookies()` calls `payload.findByID({ collection: 'users' })`
5. **Payload automatically tries to JOIN with `users_sessions` table** to load user sessions
6. If `users_sessions` table doesn't exist or has wrong structure → **Query fails → Authentication fails**

## ✅ Solution

Run the SQL script to create/fix the `users_sessions` table:

**File:** `scripts/fix_users_sessions_with_token.sql`

This script:
- Creates the `users_sessions` table with correct structure
- Adds `token` column (some Payload versions need it)
- Creates proper indexes for performance
- Tests the exact query Payload uses

## 📋 Steps to Fix

1. **Run SQL Script in Neon:**
   - Open Neon Console: https://console.neon.tech
   - Select your SARSYC database project
   - Go to SQL Editor
   - Copy/paste contents of `scripts/fix_users_sessions_with_token.sql`
   - Click "Run"

2. **Redeploy Application:**
   - Push to git (or manually redeploy in Vercel)
   - Wait for deployment to complete
   - This ensures the app picks up the new table structure

3. **Test Login:**
   - Go to `/login`
   - Choose "Admin"
   - Email: `admin@sarsyc.org`
   - Password: `Admin@1234`

## 🔗 Why This Happened

The `users_sessions` table is required by Payload CMS for session management. When Payload queries a user, it automatically tries to load their active sessions. If the table doesn't exist, the query fails and breaks authentication.

This wasn't an issue before because:
- The table might have existed initially
- Or Payload wasn't querying sessions until the reviewer feature was added
- The reviewer feature added more user role checks, triggering more authentication queries

## ✅ Verification

After running the script, verify:

1. **Table exists:**
   ```sql
   SELECT * FROM information_schema.tables WHERE table_name = 'users_sessions';
   ```

2. **Structure is correct:**
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'users_sessions' ORDER BY ordinal_position;
   ```

3. **Query works:**
   ```sql
   SELECT "users"."id", "users"."email", "users_sessions"."data" as "sessions"
   FROM "users" "users"
   LEFT JOIN LATERAL (
     SELECT coalesce(json_agg(...), '[]'::json) as "data"
     FROM "users_sessions" WHERE "_parent_id" = "users"."id"
   ) "users_sessions" ON true
   WHERE "users"."email" = 'admin@sarsyc.org';
   ```

## 🎯 Expected Result

After fixing:
- ✅ Login works
- ✅ Admin panel loads
- ✅ User profile loads correctly
- ✅ Reviewer role filtering works
- ✅ No more "Failed query" errors
