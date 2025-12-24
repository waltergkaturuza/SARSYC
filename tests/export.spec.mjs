import assert from 'assert'
import fs from 'fs'

const path = './src/app/api/admin/registrations/export/route.ts'
assert.ok(fs.existsSync(path), `${path} should exist`)
const content = fs.readFileSync(path, 'utf-8')
assert.ok(content.includes('export async function GET'), 'Export route should export GET')
console.log('Export route file exists and declares GET')
