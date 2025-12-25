#!/usr/bin/env node

/**
 * Create simple placeholder icons for PWA
 * Generates simple colored square PNG files as placeholders
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple 1x1 pixel PNG in base64 (will be scaled by browser)
// This is a minimal valid PNG - blue square
const icon192Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const icon512Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const publicDir = path.join(__dirname, '..', 'public')

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// Create simple SVG-based PNGs (as data URIs won't work for manifest, we'll create minimal valid PNGs)
// Actually, let's create a proper minimal PNG using a library or just create SVG files
// For now, create simple 1px PNG files as placeholders

function createMinimalPNG(size, color = [14, 165, 233]) { // primary-600 color
  // Create a minimal valid PNG (1x1 pixel, will be scaled)
  // PNG signature + minimal IHDR + IDAT + IEND
  const buffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width (1 pixel)
    0x00, 0x00, 0x00, 0x01, // height (1 pixel)
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, // compressed data + CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ])
  return buffer
}

try {
  // Create minimal placeholder PNGs
  const icon192 = createMinimalPNG(192)
  const icon512 = createMinimalPNG(512)
  
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192)
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512)
  
  console.log('✅ Created placeholder icons:')
  console.log('   - icon-192.png')
  console.log('   - icon-512.png')
  console.log('\n⚠️  Note: These are minimal placeholder files.')
  console.log('   Replace them with proper icons before production deployment.\n')
} catch (error) {
  console.error('❌ Error creating icons:', error.message)
  process.exit(1)
}

