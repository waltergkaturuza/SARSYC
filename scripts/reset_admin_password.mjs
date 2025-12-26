// This script uses Payload CLI format
// Run with: ADMIN_PASSWORD=<new_password> npm run payload -- run scripts/reset_admin_password.mjs
// Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local
export default async ({ payload }) => {
  try {
    console.log('🔐 Resetting admin password...')
    
    // Get email and password from environment variables
    const email = process.env.ADMIN_EMAIL || 'admin@sarsyc.org'
    const newPassword = process.env.ADMIN_PASSWORD
    
    if (!newPassword) {
      console.error('❌ Error: ADMIN_PASSWORD environment variable is required')
      console.log('\nUsage:')
      console.log('  ADMIN_PASSWORD=<new_password> npm run payload -- run scripts/reset_admin_password.mjs')
      console.log('  or set ADMIN_PASSWORD in .env.local file')
      console.log('\nExample:')
      console.log('  ADMIN_PASSWORD=Admin@1234 npm run payload -- run scripts/reset_admin_password.mjs')
      return
    }
    
    if (newPassword.length < 8) {
      console.error('❌ Error: Password must be at least 8 characters long')
      return
    }
    
    console.log(`📧 Looking for user: ${email}`)
    console.log(`🔑 Setting new password...`)
    
    // Find the user by email
    const result = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
      depth: 0,
    })
    
    if (result.totalDocs === 0) {
      console.error(`❌ Error: User with email "${email}" not found`)
      console.log('\nAvailable users:')
      const allUsers = await payload.find({
        collection: 'users',
        limit: 10,
        depth: 0,
      })
      allUsers.docs.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`)
      })
      return
    }
    
    const user = result.docs[0]
    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.role})`)
    
    // Update the password using overrideAccess to bypass authentication
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: newPassword,
      },
      overrideAccess: true, // Bypass access control
    })
    
    console.log(`✅ Password successfully reset for ${email}`)
    console.log(`\n📝 New password: ${newPassword}`)
    console.log('\n⚠️  Please change this password after logging in for security!')
  } catch (error) {
    console.error('❌ Error resetting password:', error.message)
    console.error(error)
    throw error
  }
}

