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
    urutan,
    jam_rencana_mulai = null,
    jam_rencana_selesai = null,
    nama,
    jam_aktual_mulai = null,
    jam_aktual_selesai = null,
    status = 'belum',
    catatan = null,
  } = body

  if (!day_id || !nama || String(nama).trim() === '') {
    return c.json({ error: 'day_id and nama are required' }, 400)
  }

  // Safe urutan sequence: between 1 and 1000, otherwise auto-increment
  let safeUrutan = typeof urutan === 'number' && urutan > 0 && urutan < 1000 ? urutan : null
  if (!safeUrutan) {
    const nextRes = await sql`SELECT COALESCE(MAX(urutan), 0) + 1 AS next FROM activities WHERE day_id = ${day_id}`
    safeUrutan = nextRes[0].next
  }

  // Clean time inputs (null if empty string)
  const cleanRencanaMulai = jam_rencana_mulai && String(jam_rencana_mulai).trim() !== '' ? jam_rencana_mulai : null
  const cleanRencanaSelesai = jam_rencana_selesai && String(jam_rencana_selesai).trim() !== '' ? jam_rencana_selesai : null
  const cleanAktualMulai = jam_aktual_mulai && String(jam_aktual_mulai).trim() !== '' ? jam_aktual_mulai : null
  const cleanAktualSelesai = jam_aktual_selesai && String(jam_aktual_selesai).trim() !== '' ? jam_aktual_selesai : null

  const rows = await sql`
    INSERT INTO activities (
      day_id, urutan, jam_rencana_mulai, jam_rencana_selesai,
      nama, jam_aktual_mulai, jam_aktual_selesai, status, catatan
    ) VALUES (
      ${day_id}, ${safeUrutan}, ${cleanRencanaMulai}, ${cleanRencanaSelesai},
      ${nama.trim()}, ${cleanAktualMulai}, ${cleanAktualSelesai}, ${status}, ${catatan}
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

  // Jika status berubah ke bukan terkendala/tidak_selesai, hapus obstacle lama
  const newStatus = b.status
  const obstacleStatuses = ['terkendala', 'tidak_selesai']
  if (newStatus && !obstacleStatuses.includes(newStatus)) {
    await sql`DELETE FROM obstacles WHERE activity_id = ${id}`
  }

  return c.json(rows[0])
})

// DELETE /api/activities/:id
activitiesRoute.delete('/:id', async (c) => {
  const sql = getDb()
  const id = c.req.param('id')
  await sql`DELETE FROM activities WHERE id = ${id}`
  return c.body(null, 204)
})
