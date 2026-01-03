#!/usr/bin/env node
/**
 * Script to debug speaker photo URLs
 * 
 * Usage:
 *   node scripts/debug_speaker_photo.mjs [speaker-id]
 */

import pg from 'pg'

const { Client } = pg

const databaseUrl = process.argv[3] || process.env.DATABASE_URL
const speakerId = process.argv[2]

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is required')
  process.exit(1)
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : {
    rejectUnauthorized: false,
  },
})

async function debugSpeakerPhoto() {
  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    if (speakerId) {
      // Debug specific speaker
      const speaker = await client.query(`
        SELECT 
          s.id,
          s.name,
          s.photo,
          m.id as media_id,
          m.url as media_url,
          m.filename,
          m.mime_type,
          m.filesize
        FROM speakers s
        LEFT JOIN media m ON s.photo = m.id
        WHERE s.id = $1;
      `, [speakerId])

      if (speaker.rows.length === 0) {
        console.log(`❌ Speaker with ID ${speakerId} not found`)
        await client.end()
        return
      }

      const row = speaker.rows[0]
      console.log('📋 Speaker Photo Debug Info:')
      console.log(`   Speaker ID: ${row.id}`)
      console.log(`   Name: ${row.name}`)
      console.log(`   Photo field value: ${row.photo}`)
      console.log(`   Media ID: ${row.media_id || 'NULL'}`)
      console.log(`   Media URL: ${row.media_url || 'NULL'}`)
      console.log(`   Filename: ${row.filename || 'NULL'}`)
      console.log(`   MIME Type: ${row.mime_type || 'NULL'}`)
      console.log(`   File Size: ${row.filesize || 'NULL'} bytes`)
    } else {
      // List all speakers with photo info
      const speakers = await client.query(`
        SELECT 
          s.id,
          s.name,
          s.photo,
          m.url as media_url,
          m.filename
        FROM speakers s
        LEFT JOIN media m ON s.photo = m.id
        ORDER BY s.created_at DESC
        LIMIT 10;
      `)

      console.log('📋 Speakers with Photo Info (last 10):\n')
      speakers.rows.forEach(row => {
        console.log(`   ${row.name} (ID: ${row.id})`)
        console.log(`     Photo ID: ${row.photo || 'NULL'}`)
        console.log(`     Media URL: ${row.media_url || 'NULL'}`)
        console.log(`     Filename: ${row.filename || 'NULL'}`)
        console.log('')
      })
    }

    await client.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
    await client.end()
    process.exit(1)
  }
}

debugSpeakerPhoto()



