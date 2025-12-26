# Admin Panel Setup Guide

## Current Issue

The Payload admin panel is not loading because Payload's admin UI requires proper integration with Next.js App Router.

## Two Approaches to Fix

### Option 1: Use Custom Express Server (Recommended for Development)

Payload CMS works best with a custom Express server that serves both Next.js and Payload.

1. **Start the custom server:**
   ```bash
   node src/server.ts
   ```
   
   This will:
   - Start Express server on port 3000
   - Initialize Payload CMS
   - Serve Payload admin UI at `/admin`
   - Handle Next.js routes

2. **Access admin panel:**
   - Go to: `http://localhost:3000/admin`
   - Login with your admin credentials

**Note:** You'll need to configure the custom server to also serve Next.js pages. Currently `server.ts` only initializes Payload.

### Option 2: Properly Integrate Payload Admin with Next.js App Router

For production with Vercel/serverless, we need to properly serve Payload's admin UI through Next.js API routes.

This requires:
1. Creating API route handlers that proxy requests to Payload
2. Serving Payload's admin UI static files
3. Configuring Next.js rewrites correctly

**Status:** This is more complex and requires additional setup.

## Quick Fix for Now

1. **Check environment variables:**
   - Ensure `PAYLOAD_SECRET` is set in `.env.local`
   - Ensure `DATABASE_URL` is set
   - Ensure `PAYLOAD_PUBLIC_SERVER_URL` matches your dev server URL

2. **Try accessing directly:**
   - The admin route at `/admin` should initialize Payload
   - Check browser console for errors
   - Check terminal for Payload initialization errors

3. **For development, consider using:**
   ```bash
   npm run dev
   # Then access http://localhost:3001/admin
   ```
   
   But note: Payload's admin UI may not load correctly without proper API routes.

## Recommended Next Steps

1. **For local development:** Set up custom server to serve both Next.js and Payload
2. **For production:** Properly configure Payload admin routes in Next.js API routes
3. **Alternative:** Use Payload Cloud or a separate Payload instance for admin panel

## References

- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Payload with Next.js](https://payloadcms.com/docs/getting-started/installation)
- Current config: `src/payload/payload.config.ts`
- Custom server: `src/server.ts`



