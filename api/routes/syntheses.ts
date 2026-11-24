import { Hono } from 'hono'
import { getDb } from '../db'

export const synthesesRoute = new Hono()

// GET /api/syntheses?period_id=...
synthesesRoute.get('/', async (c) => {
  const sql = getDb()
  const periodId = c.req.query('period_id')
  if (!periodId) return c.json([])

  const rows = await sql`
    SELECT * FROM syntheses WHERE period_id = ${periodId}
  `
  return c.json(rows)
})

// POST /api/syntheses/upsert
synthesesRoute.post('/upsert', async (c) => {
  const sql = getDb()
  const body = await c.req.json()
  const { period_id, jenis, isi } = body

  const rows = await sql`
    INSERT INTO syntheses (period_id, jenis, isi, updated_at)
    VALUES (${period_id}, ${jenis}, ${isi}, NOW())
    ON CONFLICT (period_id, jenis)
    DO UPDATE SET isi = EXCLUDED.isi, updated_at = NOW()
    RETURNING *
  `
  return c.json(rows[0])
})
