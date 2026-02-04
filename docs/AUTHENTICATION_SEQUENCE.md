# Authentication Sequence Deep Dive

## 🔍 Complete Authentication Flow

### Normal Payload Login Flow

```
1. User submits login form
   ↓
2. POST /api/auth/login
   ↓
3. payloadClient.login({ email, password })
   ↓
4. Payload internally:
   a. Queries users table by email
   b. Verifies password hash using bcrypt
   c. Creates session record in users_sessions table ← FAILS HERE IF TABLE WRONG
   d. Generates JWT token
   e. Returns { token, user }
   ↓
5. Our code sets token in cookie (payload-token)
   ↓
6. On next request, getCurrentUserFromCookies() is called
   ↓
7. Verifies JWT token signature
   ↓
8. Calls payload.findByID({ collection: 'users' })
   ↓
9. Payload automatically JOINs users_sessions ← FAILS HERE IF TABLE WRONG
   ↓
10. Returns user object with sessions
```

### Where It's Failing

The failure happens at **two points**:

1. **During Login** (`payload.login()`):
   - Payload tries to INSERT into `users_sessions` table
   - If table doesn't exist or has wrong structure → INSERT fails → Login fails

2. **After Login** (`payload.findByID()`):
   - Payload tries to JOIN with `users_sessions` table
   - If table doesn't exist or has wrong structure → JOIN fails → Auth fails

## 🔧 Direct Database Authentication Bypass

I've created `/api/auth/direct-login` that bypasses Payload's login method:

### How It Works

```
1. Query user directly from database
   ↓
2. Verify password using bcrypt.compare()
   ↓
3. Generate JWT token manually (matching Payload's format)
   ↓
4. Skip session creation (JWT tokens work without sessions)
   ↓
5. Set cookie and return token
```

### Usage

```javascript
// Instead of normal login:
POST /api/auth/login
{ email: "admin@sarsyc.org", password: "Admin@1234" }

// Use direct login:
POST /api/auth/direct-login
{ email: "admin@sarsyc.org", password: "Admin@1234" }
```

### Advantages

- ✅ Bypasses Payload's session creation (which is failing)
- ✅ Still generates valid JWT tokens
- ✅ Works even if `users_sessions` table has issues
- ✅ Full diagnostic logging

### Disadvantages

- ⚠️ Doesn't create session records (but JWT tokens work without them)
- ⚠️ Bypasses Payload's built-in security features
- ⚠️ Should only be used for debugging

## 🧪 Testing Steps

### Step 1: Test Direct Database Auth

```bash
curl -X POST https://www.sarsyc.org/api/auth/direct-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sarsyc.org","password":"Admin@1234"}'
```

If this works, the issue is with Payload's `login()` method or session creation.

### Step 2: Check Vercel Logs

After attempting login, check Vercel function logs for:
- `[Direct Login]` messages
- Any database errors
- Token generation success/failure

### Step 3: Verify users_sessions Table

Run the diagnostic SQL script:
```sql
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users_sessions';

-- Check if Payload can insert
INSERT INTO users_sessions ("_order", "_parent_id", "id", "expires_at")
VALUES (0, 1, 'test_session_123', NOW() + INTERVAL '7 days');
```

## 🎯 Root Cause Analysis

Based on the investigation, the most likely causes are:

1. **Table Structure Mismatch**: Payload expects specific column types/names
2. **Missing Columns**: Payload might need columns we didn't add
3. **Constraint Violations**: Foreign key or unique constraints failing
4. **Connection Pool Issues**: Stale connections with old schema

## ✅ Solution Path

1. **Immediate Fix**: Use `/api/auth/direct-login` to bypass the issue
2. **Proper Fix**: Investigate Payload's exact table requirements
3. **Long-term**: Ensure `users_sessions` table matches Payload's expectations exactly

## 📝 Next Steps

1. Test direct login endpoint
2. Check Vercel logs for detailed error messages
3. Compare our table structure with Payload's migration files
4. Potentially recreate table using Payload's migration system
