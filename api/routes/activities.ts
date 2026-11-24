import { Hono } from 'hono'
import { getDb } from '../db'

export const activitiesRoute = new Hono()

// GET /api/activities?day_id=...
activitiesRoute.get('/', async (c) => {
  const sql = getDb()
  const dayId = c.req.query('day_id')
  if (!dayId) return c.json({ error: 'day_id is required' }, 400)

  const rows = await sql`
    SELECT * FROM activities WHERE day_id = ${dayId} ORDER BY urutan ASC, created_at ASC
  `
  return c.json(rows)
})

// POST /api/activities
activitiesRoute.post('/', async (c) => {
  const sql = getDb()
  const body = await c.req.json()
  const {
    day_id,
    urutan = 0,
    jam_rencana_mulai = null,
    jam_rencana_selesai = null,
    nama,
    jam_aktual_mulai = null,
    jam_aktual_selesai = null,
    status = 'belum',
    catatan = null,
  } = body

  const rows = await sql`
    INSERT INTO activities (
      day_id, urutan, jam_rencana_mulai, jam_rencana_selesai,
      nama, jam_aktual_mulai, jam_aktual_selesai, status, catatan
    ) VALUES (
      ${day_id}, ${urutan}, ${jam_rencana_mulai}, ${jam_rencana_selesai},
      ${nama}, ${jam_aktual_mulai}, ${jam_aktual_selesai}, ${status}, ${catatan}
    )
    RETURNING *
  `
  return c.json(rows[0], 201)
})

// PATCH /api/activities/:id
activitiesRoute.patch('/:id', async (c) => {
  const sql = getDb()
  const id = c.req.param('id')
  const b = await c.req.json()

  const rows = await sql`
    UPDATE activities
    SET nama = COALESCE(${b.nama ?? null}, nama),
        urutan = COALESCE(${b.urutan ?? null}, urutan),
        jam_rencana_mulai = COALESCE(${b.jam_rencana_mulai ?? null}, jam_rencana_mulai),
        jam_rencana_selesai = COALESCE(${b.jam_rencana_selesai ?? null}, jam_rencana_selesai),
        jam_aktual_mulai = COALESCE(${b.jam_aktual_mulai ?? null}, jam_aktual_mulai),
        jam_aktual_selesai = COALESCE(${b.jam_aktual_selesai ?? null}, jam_aktual_selesai),
        status = COALESCE(${b.status ?? null}, status),
        catatan = COALESCE(${b.catatan ?? null}, catatan),
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  return c.json(rows[0])
})

// DELETE /api/activities/:id
activitiesRoute.delete('/:id', async (c) => {
  const sql = getDb()
  const id = c.req.param('id')
  await sql`DELETE FROM activities WHERE id = ${id}`
  return c.body(null, 204)
})
