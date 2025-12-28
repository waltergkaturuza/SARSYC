# Admin Login Redirect Debugging Guide

## Issue
Admin login succeeds (200 response) but redirect to `/admin` fails - user stays on login page.

## Root Cause
The cookie check was blocking the redirect. Even though the cookie was being set, the check was too strict and prevented the redirect from executing.

## Fixes Applied

### 1. Removed Blocking Cookie Check
- **Before**: If cookie wasn't found in `document.cookie`, the redirect was blocked and an error was shown
- **After**: Always redirect on successful login - cookie is set both server-side and client-side

### 2. Improved Cookie Setting
- Set cookie client-side with proper URL encoding: `encodeURIComponent(data.token)`
- Set cookie server-side via `response.cookies.set()`
- Also set via `Set-Cookie` header as backup
- Use `credentials: 'include'` in fetch request

### 3. Enhanced Logging
- Added comprehensive logging in middleware to track cookie availability
- Added logging in login flow to track redirect execution
- Logs show token presence, cookie status, and redirect target

## Testing Steps

1. **Open Browser Console** (F12 → Console tab)
2. **Go to login page**: https://sarsyc.vercel.app/login
3. **Select "Admin" type**
4. **Enter credentials**:
   - Email: `admin@sarsyc.org`
   - Password: `Admin@1234`
5. **Click Login**
6. **Watch console logs**:
   - Should see: `[Admin Login] Login successful!`
   - Should see: `[Admin Login] About to redirect to: /admin`
   - Should see: `[Admin Login] Executing redirect now...`
7. **Check if redirect happens** - page should navigate to `/admin`

## If Still Not Working

### Check Browser Console
Look for:
- Any JavaScript errors
- Cookie setting messages
- Redirect execution messages

### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "admin"
3. Check the request to `/admin`:
   - Status code (should be 200, not 307)
   - Request headers → Cookie header should contain `payload-token`
   - Response headers

### Check Application Tab
1. Open DevTools → Application tab
2. Go to Cookies → `https://sarsyc.vercel.app`
3. Look for `payload-token` cookie
4. Check its value, path, and expiration

### Manual Cookie Test
If redirect still fails, try manually setting the cookie and navigating:

```javascript
// In browser console after successful login
document.cookie = "payload-token=YOUR_TOKEN_HERE; path=/; max-age=604800; SameSite=Lax; Secure"
window.location.href = '/admin'
```

## Expected Behavior

1. ✅ Login API returns 200 with token
2. ✅ Cookie is set (both server and client side)
3. ✅ Redirect executes: `window.location.href = '/admin'`
4. ✅ Middleware finds cookie and allows access
5. ✅ Admin page loads successfully

## Debugging Commands

### Check if cookie is set:
```javascript
console.log('Cookies:', document.cookie)
console.log('Has payload-token:', document.cookie.includes('payload-token'))
```

### Check localStorage:
```javascript
console.log('Auth token:', localStorage.getItem('auth_token'))
console.log('User data:', localStorage.getItem('user_data'))
```

### Force redirect (if stuck):
```javascript
window.location.href = '/admin'
```



