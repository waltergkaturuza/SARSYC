# Password Reset Instructions

## 🔐 Current Issue

Account is unlocked but login still fails with "Invalid email or password" (401).

## ✅ Solution Steps

### Step 1: Reset Password Hash

Run `scripts/complete_password_reset.sql` in Neon to:
- Reset password hash to known value (Admin@1234)
- Unlock account completely
- Reset login attempts
- Verify all fields

### Step 2: Test Direct Login (Bypasses Payload)

After deploying, test the direct login endpoint that bypasses Payload's login method:

```bash
POST https://www.sarsyc.org/api/auth/direct-login
{
  "email": "admin@sarsyc.org",
  "password": "Admin@1234"
}
```

**If this works:** The issue is with Payload's `login()` method (likely the JOIN query)
**If this fails:** The issue is with password verification or database connection

### Step 3: Test Debug Login

Test the debug endpoint for detailed logs:

```bash
POST https://www.sarsyc.org/api/auth/login-debug
{
  "email": "admin@sarsyc.org",
  "password": "Admin@1234",
  "type": "admin"
}
```

This will show exactly which step fails.

## 🎯 Important Notes

1. **Select "Admin" Role:** Make sure to select "Admin" on the login page, not "Participant"
2. **Email Case:** Use `admin@sarsyc.org` (lowercase)
3. **Password:** Use `Admin@1234` (exact case: capital A, @, 1234)

## 🔍 If Still Failing

Check Vercel logs for:
- `[Login API] Step 4:` - Should show if `payload.login()` succeeds
- `[Login API] Step 5:` - Should show if user query (JOIN) succeeds
- Any error messages about password verification

## 📋 Expected Hash Value

The password hash for `Admin@1234` should be:
```
$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq
```

If the hash in the database doesn't match this, password verification will fail.
