# Fixing 404 Errors for Static Assets

If you're seeing 404 errors for Next.js static assets like:
- `/_next/static/chunks/main-app.js 404`
- `/_next/static/css/app/layout.css 404`

## Solution

These errors occur when the Next.js dev server needs to rebuild its cache. Follow these steps:

### 1. Stop the Dev Server
Press `Ctrl+C` in the terminal where `npm run dev` is running.

### 2. Clear the Build Cache
```powershell
Remove-Item -Recurse -Force .next
```

### 3. Restart the Dev Server
```powershell
npm run dev
```

### 4. Hard Refresh the Browser
- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

This will clear the browser cache and force it to load the new assets.

## Why This Happens

Next.js generates static assets dynamically during development. Sometimes these assets can become out of sync with the current code, especially after:
- Code changes
- Dependencies updates
- Build cache corruption
- Switching between branches

The `.next` directory contains the build cache, and clearing it forces Next.js to rebuild everything fresh.

## Alternative: Use Production Build

If the issue persists, you can also try:

```powershell
npm run build
npm run start
```

This runs the production build which is more stable, though slower for development.

