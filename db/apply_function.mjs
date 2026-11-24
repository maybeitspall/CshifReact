// Jalankan: node db/apply_function.mjs
// Gunakan native fetch + Neon HTTP API untuk jalankan raw SQL
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql_text = readFileSync(join(__dirname, 'migrations/003_functions.sql'), 'utf8')

// Pakai neon() tagged template — wrap sql_text sebagai template literal trick
import { neon } from '@neondatabase/serverless'

const DATABASE_URL = 'postgresql://neondb_owner:npg_pByXWt0IKOe2@ep-dawn-art-bc511cb2-pooler.c-16.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const sql = neon(DATABASE_URL)

// neon tagged template: sql`...` — kita buat template object sendiri
const strings = [sql_text]
strings.raw = [sql_text]

try {
  const result = await sql(strings)
  console.log('✅ fn_period_summary updated successfully.', result)
} catch (err) {
  console.error('❌ Error:', err.message)
  process.exit(1)
}
