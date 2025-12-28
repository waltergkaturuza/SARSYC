#!/usr/bin/env node
/**
 * Script to find and clean up orphaned speaker photos
 * 
 * This script finds media files that are not linked to any speaker
 * (orphaned photos from previous uploads that weren't cleaned up)
 * 
 * Usage:
 *   node scripts/cleanup_orphaned_speaker_photos.mjs [--dry-run] "postgresql://user:pass@host/db"
 *   Or set DATABASE_URL and run: node scripts/cleanup_orphaned_speaker_photos.mjs [--dry-run]
 */

import pg from 'pg'

const { Client } = pg

// Get database URL from command line argument or environment
const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const databaseUrl = args.find(arg => arg.startsWith('postgresql://')) || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is required')
  console.error('   Usage: node scripts/cleanup_orphaned_speaker_photos.mjs [--dry-run] "postgresql://user:pass@host/db"')
  console.error('   Or set DATABASE_URL environment variable')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : {
    rejectUnauthorized: false,
  },
})

async function cleanupOrphanedPhotos() {
  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected to database\n')

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be deleted\n')
    }

    // Find all media files that are linked to speakers
    const linkedPhotos = await client.query(`
      SELECT DISTINCT photo as media_id
      FROM speakers
      WHERE photo IS NOT NULL;
    `)

    const linkedPhotoIds = linkedPhotos.rows.map(row => row.media_id).filter(Boolean)
    console.log(`📋 Found ${linkedPhotoIds.length} photos currently linked to speakers\n`)

    // Find all media files with "Speaker photo" in alt text
    const speakerPhotos = await client.query(`
      SELECT id, alt, filename, url, created_at
      FROM media
      WHERE alt LIKE 'Speaker photo:%'
      ORDER BY created_at DESC;
    `)

    console.log(`📸 Found ${speakerPhotos.rows.length} total speaker photos in media collection\n`)

    // Find orphaned photos (not linked to any speaker)
    const orphanedPhotos = speakerPhotos.rows.filter(photo => 
      !linkedPhotoIds.includes(String(photo.id))
    )

    if (orphanedPhotos.length === 0) {
      console.log('✅ No orphaned speaker photos found!')
      await client.end()
      return
    }

    console.log(`⚠️  Found ${orphanedPhotos.length} orphaned speaker photos:\n`)
    orphanedPhotos.forEach((photo, index) => {
      console.log(`   ${index + 1}. ID: ${photo.id}`)
      console.log(`      Alt: ${photo.alt}`)
      console.log(`      Filename: ${photo.filename || 'N/A'}`)
      console.log(`      Created: ${photo.created_at}`)
      console.log('')
    })

    if (dryRun) {
      console.log('💡 Run without --dry-run to delete these orphaned photos')
      console.log('   Note: This will delete the media records from the database')
      console.log('   The actual files in Vercel Blob will need to be cleaned up manually')
    } else {
      console.log('🗑️  Deleting orphaned photos...')
      
      for (const photo of orphanedPhotos) {
        try {
          await client.query('DELETE FROM media WHERE id = $1', [photo.id])
          console.log(`   ✅ Deleted photo ${photo.id} (${photo.alt})`)
        } catch (err) {
          console.error(`   ❌ Failed to delete photo ${photo.id}:`, err.message)
        }
      }
      
      console.log(`\n✅ Cleaned up ${orphanedPhotos.length} orphaned photos`)
      console.log('   Note: Files in Vercel Blob storage need to be cleaned up manually')
      console.log('   Go to Vercel Dashboard > Storage > Browser to delete the files')
    }

    await client.end()
    console.log('\n✅ Script completed successfully')
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    await client.end()
    process.exit(1)
  }
}

// Run the script
cleanupOrphanedPhotos()

