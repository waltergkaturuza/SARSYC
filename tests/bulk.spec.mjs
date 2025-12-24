import assert from 'assert'
import fs from 'fs'

const path = './src/app/api/admin/registrations/bulk/route.ts'
assert.ok(fs.existsSync(path), `${path} should exist`)
const content = fs.readFileSync(path, 'utf-8')
assert.ok(content.includes('export async function POST'), 'Bulk route should export POST')
console.log('Bulk route file exists and declares POST')
