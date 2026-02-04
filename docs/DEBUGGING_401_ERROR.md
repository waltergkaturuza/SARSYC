# Debugging 401 "Invalid email or password" Error

## 🔍 Current Situation

- ✅ Account unlocked
- ✅ All database columns exist
- ✅ `users_sessions` table exists
- ❌ Direct-login returns 401 (password verification failing)

## 🎯 Next Steps

### Step 1: Verify Password Hash

Run `scripts/check_password_hash_direct.sql` in Neon to:
- Check the exact hash value in the database
- Compare it to the expected hash for `Admin@1234`
- Reset it if it doesn't match

**Expected hash for `Admin@1234`:**
```
$2b$10$QL8ciMgeyKMyeu3oQ1rwCuckTHm8gQWXjRHnPqwhL6grLdSBEizEq
```

### Step 2: Check Vercel Logs

After deploying the enhanced direct-login endpoint, check Vercel function logs for:
- `[Direct Login] Hash exists:` - Should be `true`
- `[Direct Login] Hash length:` - Should be `60` (bcrypt hash length)
- `[Direct Login] Hash format:` - Should be `$2b$10$`
- `[Direct Login] Password match result:` - This tells us if bcrypt.compare succeeded

### Step 3: Test Again

After verifying the hash, test direct-login again:

```powershell
Invoke-RestMethod -Uri "https://www.sarsyc.org/api/auth/direct-login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@sarsyc.org","password":"Admin@1234"}'
```

The response will now include a `debug` object with detailed information about why it failed.

## 🔍 Possible Issues

### Issue 1: Wrong Password Hash
**Symptom:** Hash doesn't match expected value
**Fix:** Run `check_password_hash_direct.sql` to reset it

### Issue 2: Hash Format Wrong
**Symptom:** Hash doesn't start with `$2b$10$`
**Fix:** Reset password hash using the correct bcrypt format

### Issue 3: Password Case Sensitivity
**Symptom:** Password might have different case
**Fix:** Ensure exact case: `Admin@1234` (capital A, @, 1234)

### Issue 4: Email Case Sensitivity
**Symptom:** Email lookup failing
**Fix:** Use lowercase: `admin@sarsyc.org`

## 📋 Checklist

- [ ] Run `check_password_hash_direct.sql` to verify hash
- [ ] Deploy enhanced direct-login endpoint
- [ ] Check Vercel logs for detailed error messages
- [ ] Test direct-login again
- [ ] Share the debug response if it still fails
