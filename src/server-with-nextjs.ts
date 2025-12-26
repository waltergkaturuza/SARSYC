import express from 'express'
import next from 'next'
import payload from 'payload'
import path from 'path'

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
})

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const PORT = process.env.PORT || 3000

// Initialize Next.js
const nextApp = next({ dev, hostname, port: Number(PORT) })
const handle = nextApp.getRequestHandler()

const start = async (): Promise<void> => {
  const app = express()

  // Initialize Payload first
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  // Prepare Next.js
  console.log('Preparing Next.js...')
  await nextApp.prepare()
  console.log('✓ Next.js ready')

  // Payload automatically handles /admin and /api/* routes
  // We only need to handle other routes with Next.js
  
  // Serve Next.js for all other routes
  app.all('*', (req, res) => {
    return handle(req, res)
  })

  app.listen(PORT, () => {
    console.log(`\n🚀 Server ready on http://localhost:${PORT}`)
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`)
    console.log(`🌐 Frontend: http://localhost:${PORT}`)
    console.log(`\nPress Ctrl+C to stop\n`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

