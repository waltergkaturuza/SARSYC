# SARSYC Logo Setup

The SARSYC logo has been integrated into the website in the following locations:

## Logo Locations

1. **Header** - Logo appears in the top navigation bar (48x48px)
2. **Footer** - Logo appears in the footer brand section (48x48px)
3. **Homepage Hero** - Large logo display in the hero section (128-160px responsive)

## Adding Your Logo File

To display the logo on the website, please add your logo file to the `public` folder:

**Required:**
- File path: `public/logo.png`
- Recommended formats: PNG (with transparency), SVG, or JPG
- Recommended size: At least 512x512px for best quality

**Alternative file names:**
If your logo file has a different name, you can update the references in:
- `src/components/layout/Header.tsx` (line 81)
- `src/components/layout/Footer.tsx` (line 122)
- `src/app/(frontend)/page.tsx` (line 59)

Simply change `/logo.png` to your filename (e.g., `/sarsyc-logo.png`).

## Logo Specifications

The logo will be automatically:
- Scaled to fit the container
- Maintained at proper aspect ratio
- Optimized for performance by Next.js Image component
- Loaded with priority on the homepage for better performance

## Current Status

✅ Code updated to display logo in Header, Footer, and Homepage
⏳ Waiting for logo file to be added to `public/logo.png`

Once you add the logo file, it will automatically appear on all pages of the website!

