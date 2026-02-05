# How to Test Direct Login Endpoint

## Method 1: Browser Console (Easiest)

1. **Open your browser** and go to `https://www.sarsyc.org`
2. **Open Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Or right-click → "Inspect"
3. **Go to Console tab**
4. **Paste this code and press Enter:**

```javascript
fetch('https://www.sarsyc.org/api/auth/direct-login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important: includes cookies
  body: JSON.stringify({
    email: 'admin@sarsyc.org',
    password: 'Admin@1234'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ Login successful!');
    console.log('Token:', data.token);
    console.log('User:', data.user);
  } else {
    console.error('❌ Login failed:', data.error);
  }
})
.catch(error => {
  console.error('Error:', error);
});
```

## Method 2: PowerShell (Windows)

Open PowerShell and run:

```powershell
$body = @{
    email = "admin@sarsyc.org"
    password = "Admin@1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://www.sarsyc.org/api/auth/direct-login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SessionVariable session

$response | ConvertTo-Json -Depth 10
```

## Method 3: curl (Command Line)

```bash
curl -X POST https://www.sarsyc.org/api/auth/direct-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sarsyc.org","password":"Admin@1234"}' \
  -v
```

## Method 4: Postman or Similar Tool

1. **Method:** POST
2. **URL:** `https://www.sarsyc.org/api/auth/direct-login`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "email": "admin@sarsyc.org",
  "password": "Admin@1234"
}
```
5. **Click Send**

## Expected Response

### Success:
```json
{
  "success": true,
  "method": "direct-database-auth",
  "user": {
    "id": 1,
    "email": "admin@sarsyc.org",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Failure:
```json
{
  "success": false,
  "error": "Invalid email or password",
  "details": "..."
}
```

## What to Look For

- ✅ **If it works:** You'll get a token and can use it to access admin panel
- ❌ **If it fails:** Check the error message to see why (password hash, user not found, etc.)

## After Successful Login

If direct-login works, you can:
1. Copy the token from the response
2. Manually set it as a cookie: `payload-token=<token>`
3. Navigate to `/admin` to access the admin panel

Or refresh the page and try the normal login again - the direct-login should have set the cookie automatically.
