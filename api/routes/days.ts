import { Hono } from 'hono'
import { getDb } from '../db'

export const daysRoute = new Hono()

// GET /api/days?period_id=...
daysRoute.get('/', async (c) => {
  const sql = getDb()
  const periodId = c.req.query('period_id')
  if (!periodId) return c.json([])

  const rows = await sql`
    SELECT * FROM days WHERE period_id = ${periodId} ORDER BY nomor_hari ASC
  `
  return c.json(rows)
})

// GET /api/days/progress?period_id=...
daysRoute.get('/progress', async (c) => {
  const sql = getDb()
  const periodId = c.req.query('period_id')
  if (!periodId) return c.json([])

  const rows = await sql`
    SELECT * FROM v_day_progress WHERE period_id = ${periodId} ORDER BY nomor_hari ASC
  `
  return c.json(rows)
})

// GET /api/days/:id (or periodId__nomorHari)
daysRoute.get('/:id', async (c) => {
  const sql = getDb()
  const id = c.req.param('id')

  if (id.includes('__')) {
    const [periodId, nomorHariStr] = id.split('__')
    const nomorHari = Number(nomorHariStr)
    const rows = await sql`
      SELECT * FROM days WHERE period_id = ${periodId} AND nomor_hari = ${nomorHari} LIMIT 1
    `
    if (rows[0]) return c.json(rows[0])

    // Sustainable: auto-generate day if it doesn't exist yet
    const periodRes = await sql`SELECT * FROM periods WHERE id = ${periodId} LIMIT 1`
    if (periodRes[0]) {
      const start = new Date(periodRes[0].tanggal_mulai)
      const curDate = new Date(start)
      curDate.setDate(start.getDate() + (nomorHari - 1))
      const dateStr = curDate.toISOString().slice(0, 10)

      const newDay = await sql`
        INSERT INTO days (period_id, nomor_hari, tanggal)
        VALUES (${periodId}, ${nomorHari}, ${dateStr})
        ON CONFLICT (period_id, nomor_hari) DO UPDATE SET updated_at = NOW()
        RETURNING *
      `
      return c.json(newDay[0])
    }
    return c.json(null)
  }

  const rows = await sql`
    SELECT * FROM days WHERE id = ${id} LIMIT 1
  `
  return c.json(rows[0] || null)
})

// PATCH /api/days/:id
daysRoute.patch('/:id', async (c) => {
  const sql = getDb()
  const id = c.req.param('id')
  const body = await c.req.json()

  const rows = await sql`
    UPDATE days
    SET motivasi = COALESCE(${body.motivasi ?? null}, motivasi),
        teks_motivasi = COALESCE(${body.teks_motivasi ?? null}, teks_motivasi),
        jumlah_penundaan = COALESCE(${body.jumlah_penundaan ?? null}, jumlah_penundaan),
        catatan_akhir = COALESCE(${body.catatan_akhir ?? null}, catatan_akhir),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return c.json(rows[0])
})
