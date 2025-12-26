import express from 'express'
import payload from 'payload'
import path from 'path'

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
})

const app = express()
const PORT = process.env.PORT || 3000

// Initialize Payload
const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
    console.log(`Admin Panel: http://localhost:${PORT}/admin`)
  })
}

start()


