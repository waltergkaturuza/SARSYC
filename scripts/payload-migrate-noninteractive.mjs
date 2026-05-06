/**
 * Runs `payload migrate` with stdin pipe so the Drizzle confirmation is answered automatically
 * when the DB contains dev-push markers (payload_migrations.batch = -1). Without this,
 * CI/Vercel builds hang on: "It looks like you've run Payload in dev mode..."
 *
 * Prefer also cleaning prod DB once: scripts/sql/clear_payload_dev_migration_marker.sql
 */

import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const payloadBin = path.join(repoRoot, 'node_modules', 'payload', 'bin.js')

const NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --no-deprecation`.replace(/\s+/g, ' ').trim()

const proc = spawn(process.execPath, [payloadBin, 'migrate'], {
  cwd: repoRoot,
  env: {
    ...process.env,
    NODE_OPTIONS,
    PAYLOAD_MIGRATING: 'true',
  },
  stdio: ['pipe', 'inherit', 'inherit'],
})

proc.stdin.end('y\n')

proc.on('error', (err) => {
  console.error(err)
  process.exit(1)
})

proc.on('exit', (code, signal) => {
  if (signal) {
    console.error(`payload migrate killed by signal: ${signal}`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})
