# How to Use Custom Server for Payload Admin

## The Problem

The Payload admin UI at `/admin` is currently stuck in a loading loop because:
1. We're serving a placeholder HTML page
2. Payload's admin UI is a full React SPA that needs proper serving
3. Next.js App Router doesn't natively support Payload's admin UI serving

## The Solution: Use Custom Express Server

You have a custom server at `src/server.ts` that properly serves Payload's admin UI.

## How to Use It

### Option 1: Stop Next.js dev server and use custom server

1. **Stop the current dev server** (Ctrl+C in the terminal)

2. **Start the custom server:**
   ```bash
   node src/server.ts
   ```

3. **Access admin at:**
   - Admin Panel: http://localhost:3000/admin
   - Frontend: http://localhost:3000

**Note:** The custom server in `src/server.ts` currently only initializes Payload. It needs to also serve Next.js pages.

### Option 2: Update Custom Server to Serve Both (Recommended)

Update `src/server.ts` to serve both Next.js and Payload admin:

```typescript
import express from 'express'
import next from 'next'
import payload from 'payload'
import path from 'path'

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
})

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()
const PORT = process.env.PORT || 3000

const start = async () => {
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  // Prepare Next.js
  await nextApp.prepare()

  const app = express()

  // Let Next.js handle all requests except /admin
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/admin')) {
      return handle(req, res)
    }
    // Payload handles /admin automatically
  })

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    console.log(`Admin Panel: http://localhost:${PORT}/admin`)
    console.log(`Frontend: http://localhost:${PORT}`)
  })
}

start()
```

### Option 3: Use Payload Cloud or Separate Admin (Alternative)

For production, consider:
1. Deploy admin panel separately
2. Use Payload Cloud for admin
3. Use headless approach with API-only access

## Current Status

- ✅ `/api/config` endpoint working (200 status)
- ✅ Payload initializing successfully
- ✅ Database connected
- ⚠️ Admin UI needs proper serving (currently placeholder)

## Warnings to Ignore (for now)

- `sharp not installed` - Optional image optimization
- `No email adapter` - Email will log to console
- `Critical dependency` - Payload internal warning, harmless

## Recommended Next Steps

1. Update `src/server.ts` to serve both Next.js and Payload
2. Run `node src/server.ts` instead of `npm run dev`
3. Access admin at `http://localhost:3000/admin`

This will give you the full Payload admin UI with all features working.

