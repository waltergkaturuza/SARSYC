import assert from 'assert'
import fs from 'fs'

const checkPaths = [
  './src/app/(admin)/participants/[id]/page.tsx',
  './src/app/api/admin/participants/[id]/checkin/route.ts',
  './src/app/api/admin/participants/[id]/badge/route.ts',
  './src/components/admin/ParticipantActions.tsx',
]
for (const p of checkPaths) {
  assert.ok(fs.existsSync(p), `${p} should exist`)
}
console.log('Participant admin files exist')
