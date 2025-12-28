import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') })
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

const { Client } = pg

async function applyMigration() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables')
    console.error('Please set DATABASE_URL in .env.local or .env')
    process.exit(1)
  }

  console.log('📦 Connecting to database...')
  
  const useSsl = /sslmode=require|ssl=true/i.test(connectionString)
  const client = new Client({ 
    connectionString, 
    ssl: useSsl ? { rejectUnauthorized: false } : undefined 
  })

  try {
    await client.connect()
    console.log('✅ Connected to database\n')

    // Read the SQL migration file
    const sqlPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'create_sponsorship_tiers_table.sql')
    console.log(`📄 Reading migration file: ${sqlPath}`)
    const sql = await readFile(sqlPath, 'utf8')

    console.log('🔄 Applying sponsorship_tiers migration...\n')
    
    // Execute the SQL
    await client.query(sql)
    
    console.log('✅ Migration applied successfully!\n')

    // Verify the table was created
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsorship_tiers'
      )
    `)

    if (tableCheck.rows[0].exists) {
      console.log('✅ Verified: sponsorship_tiers table exists\n')
      
      // Check if benefits table exists
      const benefitsCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'sponsorship_tiers_benefits'
        )
      `)
      
      if (benefitsCheck.rows[0].exists) {
        console.log('✅ Verified: sponsorship_tiers_benefits table exists\n')
      }
      
      // Get table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'sponsorship_tiers'
        ORDER BY ordinal_position
      `)
      
      console.log('📋 Table structure:')
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`)
      })
      
      console.log('\n🎉 Migration completed successfully!')
      console.log('You can now access /admin/sponsorship-tiers\n')
    } else {
      console.error('❌ Warning: Table verification failed - table may not have been created')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    if (error.code) {
      console.error(`   Error code: ${error.code}`)
    }
    if (error.detail) {
      console.error(`   Detail: ${error.detail}`)
    }
    console.error('\nFull error:', error)
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed')
  }
}

applyMigration()


