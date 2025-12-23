import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const migrationPath = path.resolve('src', 'migrations', '20251223_130213.ts')
const outPath = path.resolve('src', 'migrations', 'sql', '20251223_130213.sql')

async function extract() {
  const content = await readFile(migrationPath, 'utf8')
  const start = content.indexOf('db.execute(sql`')
  if (start === -1) throw new Error('db.execute(sql` not found')
  const rest = content.slice(start + 'db.execute(sql`'.length)
  const end = rest.indexOf('`)')
  if (end === -1) throw new Error('closing `) not found')
  const sql = rest.slice(0, end)
  await writeFile(outPath, sql, 'utf8')
  console.log('Extracted SQL to', outPath)
}

extract().catch(err => { console.error(err); process.exit(1) })