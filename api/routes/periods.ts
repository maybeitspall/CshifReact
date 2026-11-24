import { Hono } from 'hono'
import { getDb } from '../db'

export const periodsRoute = new Hono()

// GET /api/periods
periodsRoute.get('/', async (c) => {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM periods ORDER BY created_at DESC
  `
  return c.json(rows)
})

// GET /api/periods/active
periodsRoute.get('/active', async (c) => {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM periods WHERE aktif = true LIMIT 1
  `
  return c.json(rows[0] || null)
})

// POST /api/periods
periodsRoute.post('/', async (c) => {
  const sql = getDb()
  const body = await c.req.json()
  const { nama, tanggal_mulai, tanggal_akhir, aktif = false } = body

  if (aktif) {
    await sql`UPDATE periods SET aktif = false`
  }

  const rows = await sql`
    INSERT INTO periods (nama, tanggal_mulai, tanggal_akhir, aktif)
    VALUES (${nama}, ${tanggal_mulai}, ${tanggal_akhir}, ${aktif})
    RETURNING *
  `
  const period = rows[0]

  // Otomatis generate hari sesuai rentang tanggal (sustainable, tanpa batas 30 hari)
  const start = new Date(tanggal_mulai)
  const end = new Date(tanggal_akhir)
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

  for (let i = 1; i <= Math.min(totalDays, 365); i++) {
    const curDate = new Date(start)
    curDate.setDate(start.getDate() + (i - 1))
    const dateStr = curDate.toISOString().slice(0, 10)
    await sql`
      INSERT INTO days (period_id, nomor_hari, tanggal)
      VALUES (${period.id}, ${i}, ${dateStr})
      ON CONFLICT (period_id, nomor_hari) DO NOTHING
    `
  }

  return c.json(period, 201)
})

// PATCH /api/periods/:id
periodsRoute.patch('/:id', async (c) => {
  const sql = getDb()
  const id = c.req.param('id')
  const body = await c.req.json()

  if (body.aktif) {
    await sql`UPDATE periods SET aktif = false WHERE id != ${id}`
  }

  const rows = await sql`
    UPDATE periods
    SET nama = COALESCE(${body.nama ?? null}, nama),
        aktif = COALESCE(${body.aktif ?? null}, aktif),
        tanggal_mulai = COALESCE(${body.tanggal_mulai ?? null}, tanggal_mulai),
        tanggal_akhir = COALESCE(${body.tanggal_akhir ?? null}, tanggal_akhir)
    WHERE id = ${id}
    RETURNING *
  `
  const updated = rows[0]

  // Jika tanggal diperpanjang, buat hari-hari baru
  if (updated && (body.tanggal_mulai || body.tanggal_akhir)) {
    const start = new Date(updated.tanggal_mulai)
    const end = new Date(updated.tanggal_akhir)
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

    for (let i = 1; i <= Math.min(totalDays, 365); i++) {
      const curDate = new Date(start)
      curDate.setDate(start.getDate() + (i - 1))
      const dateStr = curDate.toISOString().slice(0, 10)
      await sql`
        INSERT INTO days (period_id, nomor_hari, tanggal)
        VALUES (${updated.id}, ${i}, ${dateStr})
        ON CONFLICT (period_id, nomor_hari) DO NOTHING
      `
    }
  }

  return c.json(updated)
})

// DELETE /api/periods/:id
periodsRoute.delete('/:id', async (c) => {
  const sql = getDb()
  const id = c.req.param('id')
  await sql`DELETE FROM periods WHERE id = ${id}`
  return c.body(null, 204)
})
