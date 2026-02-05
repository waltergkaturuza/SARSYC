# Authentication Diagnostics Guide

## 🔍 Comprehensive Investigation Plan

This document outlines a systematic approach to identify exactly where authentication is failing.

## 📋 Diagnostic Tools Created

### 1. Debug Login Endpoint
**Path:** `/api/auth/login-debug`

**Purpose:** Step-by-step logging of the entire authentication process

**Usage:**
```bash
POST /api/auth/login-debug
{
  "email": "admin@sarsyc.org",
  "password": "Admin@1234",
  "type": "admin"
}
```

**What it logs:**
- Step 1: Getting Payload client
- Step 2: Finding user in database
- Step 3: Checking account lock status
- Step 4: **Calling payload.login()** ← Session creation happens here
- Step 5: **Verifying user query** ← JOIN happens here
- Step 6: Success

**Response includes:**
- Detailed logs for each step
- Error details if any step fails
- Error analysis (database error, password error, session error)
- Exact step where failure occurred

### 2. Direct Database Authentication
**Path:** `/api/auth/direct-login`

**Purpose:** Bypass Payload's login method entirely

**Usage:**
```bash
POST /api/auth/direct-login
{
  "email": "admin@sarsyc.org",
  "password": "Admin@1234"
}
```

**What it does:**
- Queries user directly
- Verifies password with bcrypt
- Generates JWT token manually
- **Skips session creation** (tests if sessions are the issue)

### 3. SQL Diagnostic Scripts

#### `test_payload_session_insert.sql`
Tests what happens when Payload tries to INSERT into `users_sessions`:
- Tests INSERT with all columns
- Tests INSERT with minimal columns
- Tests data type validation
- Checks constraints

#### `test_payload_session_join.sql`
Tests the exact JOIN query Payload uses:
- Tests lateral join subquery
- Tests full query with all columns
- Tests with users that have no sessions
- Tests column name case sensitivity

## 🎯 Investigation Steps

### Step 1: Run SQL Diagnostic Scripts

Run both SQL scripts in Neon to verify table structure:

1. **Run `test_payload_session_insert.sql`**
   - This will tell us if INSERT operations work
   - If INSERT fails, we'll see the exact error
   - Check for: data type mismatches, constraint violations, missing columns

2. **Run `test_payload_session_join.sql`**
   - This will tell us if JOIN operations work
   - If JOIN fails, we'll see the exact error
   - Check for: column name issues, NULL value problems, ordering issues

### Step 2: Test Debug Login Endpoint

After deploying, test the debug endpoint:

```bash
curl -X POST https://www.sarsyc.org/api/auth/login-debug \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sarsyc.org","password":"Admin@1234","type":"admin"}'
```

**Look for:**
- Which step fails (Step 4 = session creation, Step 5 = JOIN)
- Error analysis section
- Detailed error messages

### Step 3: Check Vercel Logs

After testing, check Vercel function logs for:
- `[Login API]` messages (from enhanced login route)
- `[Direct Login]` messages (from direct login)
- `[Login API] 🔍 DIAGNOSIS` messages (error analysis)

### Step 4: Compare Table Structure

Compare our table structure with Payload's expectations:

**Our current structure:**
```sql
CREATE TABLE users_sessions (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar NOT NULL PRIMARY KEY,
  "token" text,
  "created_at" timestamp(3) with time zone,
  "expires_at" timestamp(3) with time zone NOT NULL,
  "updated_at" timestamp(3) with time zone DEFAULT now()
);
```

**Payload's expected structure (from migration):**
```sql
CREATE TABLE users_sessions (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL,
  "id" varchar PRIMARY KEY NOT NULL,
  "created_at" timestamp(3) with time zone,
  "expires_at" timestamp(3) with time zone NOT NULL
);
```

**Differences:**
- We added `token` column (might be causing issues)
- We added `updated_at` column (might be causing issues)
- Column order might matter

## 🔍 Common Failure Points

### Failure Point 1: During Login (payload.login())

**Symptoms:**
- Error occurs at Step 4 in debug endpoint
- Error message mentions `users_sessions`, `INSERT`, or database error codes
- `isSessionError: true` in error analysis

**Possible Causes:**
1. **Missing columns:** Payload expects columns we don't have
2. **Extra columns:** We have columns Payload doesn't expect
3. **Wrong data types:** Column types don't match Payload's expectations
4. **Constraint violations:** Foreign key or unique constraints failing
5. **Column order:** Payload might expect specific column order

**Fix:**
- Run `test_payload_session_insert.sql` to see exact INSERT error
- Adjust table structure to match Payload's exact requirements
- Remove extra columns if needed

### Failure Point 2: After Login (payload.findByID())

**Symptoms:**
- Error occurs at Step 5 in debug endpoint
- Error message mentions `users_sessions`, `JOIN`, or `lateral`
- `isJoinError: true` in error analysis

**Possible Causes:**
1. **Column name mismatch:** Case sensitivity or naming issues
2. **NULL values:** NULL in required columns causing JOIN issues
3. **Ordering issues:** `_order` column causing problems
4. **JSON aggregation:** Issues with `json_agg` or `json_build_array`

**Fix:**
- Run `test_payload_session_join.sql` to see exact JOIN error
- Check for NULL values in required columns
- Verify column names match exactly (case-sensitive)

## 📊 Expected Results

### If INSERT fails:
- SQL script will show exact error
- Debug endpoint will show Step 4 failure
- Error will include database error code (42P01, 42703, 23505, etc.)

### If JOIN fails:
- SQL script will show exact error
- Debug endpoint will show Step 5 failure
- Error will mention `users_sessions` or `lateral`

### If both work:
- Issue is elsewhere (password verification, token generation, etc.)
- Check direct-login endpoint results

## ✅ Next Steps After Diagnosis

1. **If INSERT fails:** Fix table structure based on SQL error
2. **If JOIN fails:** Fix table structure or column issues
3. **If both work:** Issue is in Payload configuration or token handling
4. **If direct-login works:** Confirms sessions are the issue, use direct-login as temporary fix

## 🚀 Quick Test Commands

```bash
# Test debug login
curl -X POST https://www.sarsyc.org/api/auth/login-debug \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sarsyc.org","password":"Admin@1234","type":"admin"}' | jq

# Test direct login (bypasses sessions)
curl -X POST https://www.sarsyc.org/api/auth/direct-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sarsyc.org","password":"Admin@1234"}' | jq
```
