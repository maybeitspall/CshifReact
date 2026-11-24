import { Hono } from 'hono'
import { getDb } from '../db'

export const obstacleCategoriesRoute = new Hono()

obstacleCategoriesRoute.get('/', async (c) => {
  const sql = getDb()
  const rows = await sql`SELECT * FROM obstacle_categories ORDER BY nama ASC`
  return c.json(rows)
})
