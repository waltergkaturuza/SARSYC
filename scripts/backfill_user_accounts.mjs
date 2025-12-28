#!/usr/bin/env node

/**
 * Backfill User Accounts Script
 * 
 * This script creates user accounts for:
 * 1. Existing speakers that don't have user accounts yet
 * 2. Existing abstracts with status 'accepted' that don't have user accounts yet
 * 
 * Usage: node scripts/backfill_user_accounts.mjs
 */

import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

// Import Payload client - will work with tsx
const { getPayloadClient } = await import('../src/lib/payload.ts')

async function backfillUserAccounts() {
  console.log('🚀 Starting user account backfill...\n')

  try {
    const payload = await getPayloadClient()

    // 1. Process existing speakers
    console.log('📋 Processing speakers...')
    const speakers = await payload.find({
      collection: 'speakers',
      limit: 1000,
      depth: 1,
      overrideAccess: true,
    })

    console.log(`   Found ${speakers.totalDocs} speakers`)

    let speakersProcessed = 0
    let speakersSkipped = 0
    let speakersErrors = 0

    for (const speaker of speakers.docs) {
      try {
        // Check if speaker has email
        if (!speaker.email || speaker.email.trim() === '') {
          console.log(`   ⚠️  Skipping speaker "${speaker.name}" (ID: ${speaker.id}) - no email`)
          speakersSkipped++
          continue
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(speaker.email)) {
          console.log(`   ⚠️  Skipping speaker "${speaker.name}" (ID: ${speaker.id}) - invalid email: ${speaker.email}`)
          speakersSkipped++
          continue
        }

        // Check if user already exists for this email
        const existingUsers = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: speaker.email.toLowerCase().trim(),
            },
          },
          limit: 1,
          depth: 0,
        })

        if (existingUsers.totalDocs > 0) {
          // User exists, link speaker to user
          const existingUser = existingUsers.docs[0]
          await payload.update({
            collection: 'speakers',
            id: speaker.id,
            data: {
              user: existingUser.id,
            },
            overrideAccess: true,
          })

          // Update user to link to speaker if not already linked
          if (!existingUser.speaker) {
            await payload.update({
              collection: 'users',
              id: existingUser.id,
              data: {
                speaker: speaker.id,
              },
              overrideAccess: true,
            })
          }

          console.log(`   ✅ Linked speaker "${speaker.name}" to existing user ${existingUser.id}`)
          speakersProcessed++
        } else {
          // Create new user account
          const nameParts = speaker.name.split(' ').filter((p) => p.trim())
          const firstName = nameParts[0] || speaker.name
          const lastName = nameParts.slice(1).join(' ') || nameParts[0] || speaker.name

          const randomPassword = crypto.randomBytes(16).toString('hex')

          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: speaker.email.toLowerCase().trim(),
              password: randomPassword,
              firstName,
              lastName,
              role: 'speaker',
              organization: speaker.organization || undefined,
              speaker: speaker.id,
            },
            overrideAccess: true,
          })

          const userId = typeof newUser === 'string' ? newUser : newUser.id

          // Link speaker to user
          await payload.update({
            collection: 'speakers',
            id: speaker.id,
            data: {
              user: userId,
            },
            overrideAccess: true,
          })

          // Generate password reset token
          const resetToken = crypto.randomBytes(32).toString('hex')
          const resetTokenExpiry = new Date()
          resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24)

          await payload.update({
            collection: 'users',
            id: userId,
            data: {
              resetPasswordToken: resetToken,
              resetPasswordExpiration: resetTokenExpiry.toISOString(),
            },
            overrideAccess: true,
          })

          console.log(`   ✅ Created user account for speaker "${speaker.name}" (${speaker.email})`)
          speakersProcessed++
        }
      } catch (error) {
        console.error(`   ❌ Error processing speaker "${speaker.name}" (ID: ${speaker.id}):`, error.message)
        speakersErrors++
      }
    }

    console.log(`\n   Speakers: ${speakersProcessed} processed, ${speakersSkipped} skipped, ${speakersErrors} errors\n`)

    // 2. Process approved abstracts
    console.log('📋 Processing approved abstracts...')
    const abstracts = await payload.find({
      collection: 'abstracts',
      where: {
        status: {
          equals: 'accepted',
        },
      },
      limit: 1000,
      depth: 1,
      overrideAccess: true,
    })

    console.log(`   Found ${abstracts.totalDocs} approved abstracts`)

    let abstractsProcessed = 0
    let abstractsSkipped = 0
    let abstractsErrors = 0

    for (const abstract of abstracts.docs) {
      try {
        // Check if abstract has author email
        if (!abstract.primaryAuthor?.email) {
          console.log(`   ⚠️  Skipping abstract "${abstract.title}" (ID: ${abstract.id}) - no author email`)
          abstractsSkipped++
          continue
        }

        const authorEmail = abstract.primaryAuthor.email.toLowerCase().trim()

        // Check if user already exists for this email
        const existingUsers = await payload.find({
          collection: 'users',
          where: {
            email: {
              equals: authorEmail,
            },
          },
          limit: 1,
          depth: 0,
        })

        if (existingUsers.totalDocs > 0) {
          // User exists, link abstract to user
          const existingUser = existingUsers.docs[0]
          await payload.update({
            collection: 'abstracts',
            id: abstract.id,
            data: {
              user: existingUser.id,
            },
            overrideAccess: true,
          })

          // Update user to link to abstract if not already linked
          if (!existingUser.abstract) {
            await payload.update({
              collection: 'users',
              id: existingUser.id,
              data: {
                abstract: abstract.id,
              },
              overrideAccess: true,
            })
          }

          console.log(`   ✅ Linked abstract "${abstract.title}" to existing user ${existingUser.id}`)
          abstractsProcessed++
        } else {
          // Create new user account
          const firstName = abstract.primaryAuthor.firstName || 'Author'
          const lastName = abstract.primaryAuthor.lastName || 'User'

          const randomPassword = crypto.randomBytes(16).toString('hex')

          const newUser = await payload.create({
            collection: 'users',
            data: {
              email: authorEmail,
              password: randomPassword,
              firstName,
              lastName,
              role: 'presenter',
              organization: abstract.primaryAuthor.organization || undefined,
              phone: abstract.primaryAuthor.phone || undefined,
              abstract: abstract.id,
            },
            overrideAccess: true,
          })

          const userId = typeof newUser === 'string' ? newUser : newUser.id

          // Link abstract to user
          await payload.update({
            collection: 'abstracts',
            id: abstract.id,
            data: {
              user: userId,
            },
            overrideAccess: true,
          })

          // Generate password reset token
          const resetToken = crypto.randomBytes(32).toString('hex')
          const resetTokenExpiry = new Date()
          resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24)

          await payload.update({
            collection: 'users',
            id: userId,
            data: {
              resetPasswordToken: resetToken,
              resetPasswordExpiration: resetTokenExpiry.toISOString(),
            },
            overrideAccess: true,
          })

          console.log(`   ✅ Created user account for presenter "${firstName} ${lastName}" (${authorEmail})`)
          abstractsProcessed++
        }
      } catch (error) {
        console.error(`   ❌ Error processing abstract "${abstract.title}" (ID: ${abstract.id}):`, error.message)
        abstractsErrors++
      }
    }

    console.log(`\n   Abstracts: ${abstractsProcessed} processed, ${abstractsSkipped} skipped, ${abstractsErrors} errors\n`)

    // Summary
    console.log('📊 Summary:')
    console.log(`   ✅ Speakers: ${speakersProcessed} user accounts created/linked`)
    console.log(`   ✅ Abstracts: ${abstractsProcessed} user accounts created/linked`)
    console.log(`   ⚠️  Skipped: ${speakersSkipped + abstractsSkipped} records (missing email)`)
    console.log(`   ❌ Errors: ${speakersErrors + abstractsErrors} records`)
    console.log('\n✨ Backfill completed!')

    process.exit(0)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the backfill
backfillUserAccounts()

