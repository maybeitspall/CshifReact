import { Hono } from 'hono'
import { getDb } from '../db'

export const obstaclesRoute = new Hono()

// GET /api/obstacles?activity_id=...
obstaclesRoute.get('/', async (c) => {
  const sql = getDb()
  const activityId = c.req.query('activity_id')
  if (!activityId) return c.json({ error: 'activity_id is required' }, 400)

  const rows = await sql`
    SELECT o.*, row_to_json(oc.*) as kategori
    FROM obstacles o
    LEFT JOIN obstacle_categories oc ON o.kategori_id = oc.id
    WHERE o.activity_id = ${activityId}
  `
  return c.json(rows)
})

// POST /api/obstacles/upsert
obstaclesRoute.post('/upsert', async (c) => {
  const sql = getDb()
  const body = await c.req.json()
  const { id, activity_id, tipe, kategori_id = null, deskripsi = null } = body

  if (id) {
    const rows = await sql`
      UPDATE obstacles
      SET tipe = ${tipe},
          kategori_id = ${kategori_id},
          deskripsi = ${deskripsi}
      WHERE id = ${id}
      RETURNING *
    `
    return c.json(rows[0])
  } else {
    const rows = await sql`
      INSERT INTO obstacles (activity_id, tipe, kategori_id, deskripsi)
      VALUES (${activity_id}, ${tipe}, ${kategori_id}, ${deskripsi})
      RETURNING *
    `
    return c.json(rows[0], 201)
  }
})

// GET /api/obstacles/categories (or alias)
obstaclesRoute.get('/categories', async (c) => {
  const sql = getDb()
  const rows = await sql`SELECT * FROM obstacle_categories ORDER BY nama ASC`
  return c.json(rows)
})
