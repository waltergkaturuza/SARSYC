/**
 * Script to create a database backup before migrations
 * Run this before any production deployment or migration
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })
dotenv.config({ path: join(__dirname, '..', '.env') })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables')
  process.exit(1)
}

async function backupDatabase() {
  try {
    // Create backups directory if it doesn't exist
    const backupsDir = join(__dirname, '..', 'backups')
    if (!existsSync(backupsDir)) {
      await mkdir(backupsDir, { recursive: true })
      console.log(`📁 Created backups directory: ${backupsDir}\n`)
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupFile = join(backupsDir, `backup_${timestamp}.sql`)

    console.log('💾 Creating database backup...\n')
    console.log(`   Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown'}`)
    console.log(`   Backup file: ${backupFile}\n`)

    // Run pg_dump
    const { stdout, stderr } = await execAsync(
      `pg_dump "${DATABASE_URL}" --no-owner --no-acl > "${backupFile}"`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
    )

    if (stderr && !stderr.includes('WARNING')) {
      console.error('⚠️  Warning:', stderr)
    }

    // Check if backup file was created and has content
    const { exec: execSync } = await import('child_process')
    const { promisify: promisifySync } = await import('util')
    const execAsyncSync = promisifySync(execSync)
    
    const { stdout: sizeOutput } = await execAsyncSync(
      process.platform === 'win32' 
        ? `powershell -Command "(Get-Item '${backupFile}').Length"`
        : `stat -f%z "${backupFile}"`
    )
    
    const fileSize = parseInt(sizeOutput.trim())
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)

    if (fileSize > 0) {
      console.log(`✅ Backup created successfully!`)
      console.log(`   File: ${backupFile}`)
      console.log(`   Size: ${fileSizeMB} MB\n`)
      
      // List recent backups
      const { stdout: lsOutput } = await execAsyncSync(
        process.platform === 'win32'
          ? `powershell -Command "Get-ChildItem '${backupsDir}' -Filter 'backup_*.sql' | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object { $_.Name + ' (' + [math]::Round($_.Length/1MB, 2) + ' MB)' }"`
          : `ls -lh ${backupsDir}/backup_*.sql 2>/dev/null | tail -5 | awk '{print $9, "(" $5 ")"}'`
      )
      
      if (lsOutput.trim()) {
        console.log('📋 Recent backups:')
        console.log(lsOutput)
      }
      
      console.log('\n✨ Backup complete! Safe to proceed with migrations.\n')
    } else {
      console.error('❌ Backup file is empty or was not created!')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error creating backup:', error.message)
    console.error('\n💡 Make sure pg_dump is installed:')
    console.error('   - macOS: brew install postgresql')
    console.error('   - Ubuntu: sudo apt-get install postgresql-client')
    console.error('   - Windows: Install PostgreSQL from postgresql.org\n')
    process.exit(1)
  }
}

// Run the backup
backupDatabase()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })

