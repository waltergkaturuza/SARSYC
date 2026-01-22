# Build Optimization Guide

## Current Build Performance: 14m 40s

### Root Causes

1. **Large Application Surface**
   - 83 pages (all analyzed at build time)
   - 68 API routes
   - Complex Payload CMS integration

2. **Heavy Dependencies**
   - `tesseract.js` (26MB+ OCR library)
   - `sharp` (image processing)
   - `leaflet` + `react-leaflet` (maps)
   - `framer-motion` (animations)
   - Payload CMS with full admin interface

3. **Build Configuration**
   - All routes marked as `force-dynamic` but still analyzed
   - No output optimization configured
   - Image optimization during build

## Optimizations Applied ✅

### 1. Next.js Config Updates
- ✅ Added `output: 'standalone'` for smaller deployments
- ✅ Enabled package import optimization for react-icons, framer-motion, date-fns
- ✅ Disabled typed routes to speed up builds
- ✅ Reduced logging verbosity

## Additional Optimizations (Recommended)

### 2. Reduce Static Page Generation

Many pages could use **ISR (Incremental Static Regeneration)** instead of being fully dynamic:

**Pages that could use ISR (revalidate every hour):**
- About pages (`/about`, `/about/vision`, `/about/history`)
- SARSYC VI pages (`/sarsyc-vi/*`)
- FAQ page
- Terms, Privacy, Accessibility pages
- Programme/Schedule (revalidate every 15 mins)

**Implementation:**
```typescript
// Example: src/app/(frontend)/about/page.tsx
export const revalidate = 3600 // 1 hour

// For frequently updated content
export const revalidate = 900 // 15 minutes
```

### 3. Lazy Load Heavy Dependencies

**Tesseract.js** (26MB+) should only load when needed:
```typescript
// Instead of: import Tesseract from 'tesseract.js'
const Tesseract = await import('tesseract.js')
```

**Leaflet maps** should be client-only:
```typescript
const Map = dynamic(() => import('@/components/Map'), { ssr: false })
```

### 4. Split Large Components

Use dynamic imports for admin-only components:
```typescript
const AdminLayout = dynamic(() => import('@/components/admin/AdminLayout'))
```

### 5. Optimize Dependencies

**Consider replacing:**
- `framer-motion` → CSS animations where possible (saves ~500KB)
- Full `date-fns` → `date-fns/format` only (tree-shake unused)

### 6. Build Cache Configuration

Add to `package.json`:
```json
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS=--no-deprecation NEXT_TELEMETRY_DISABLED=1 next build"
  }
}
```

### 7. Vercel Configuration

Update `vercel.json`:
```json
{
  "buildCommand": "next build",
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "crons": []
}
```

## Expected Improvements

| Optimization | Time Saved | Effort |
|-------------|-----------|--------|
| Standalone output | 2-3 min | ✅ Done |
| ISR for static pages | 3-5 min | Easy |
| Lazy load Tesseract | 1-2 min | Easy |
| Dynamic imports | 1-2 min | Medium |
| Dependency optimization | 2-4 min | Medium |

**Target build time: 5-8 minutes** (vs. current 14m 40s)

## Quick Wins (Implement Now)

1. ✅ Applied Next.js config optimizations
2. Add ISR to static pages (10 minutes work)
3. Lazy load Tesseract.js (5 minutes work)
4. Make Leaflet client-only (5 minutes work)

## Monitor Build Performance

After each optimization:
1. Deploy to Vercel
2. Check build logs
3. Compare build time
4. Verify pages still work correctly

## Notes

- **Vercel Free Tier**: Has build time limits (consider upgrading to Pro if needed)
- **Cold starts**: First deployment after code changes will always be slower
- **Incremental builds**: Subsequent builds with minimal changes should be faster
