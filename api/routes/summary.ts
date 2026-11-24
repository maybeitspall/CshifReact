import { Hono } from 'hono'
import { getDb } from '../db'

export const summaryRoute = new Hono()

const defaultSummary = {
  rata_progres: 0,
  rata_motivasi: null,
  total_penundaan: 0,
  hari_terisi: 0,
  distribusi: { selesai: 0, setengah: 0, belum: 0, terkendala: 0, tidak_selesai: 0 },
  internal: 0,
  eksternal: 0,
  top_kategori: [],
  hari_terbaik: [],
  hari_terburuk: [],
  korelasi: null,
  pasangan_count: 0
}

// GET /api/summary or /api/summary/
summaryRoute.get('/', (c) => c.json(defaultSummary))

// GET /api/summary/:periodId
summaryRoute.get('/:periodId', async (c) => {
  const sql = getDb()
  const periodId = c.req.param('periodId')

  if (!periodId || periodId.trim() === '' || periodId === 'undefined') {
    return c.json(defaultSummary)
  }

  try {
    const res = await sql`
      SELECT fn_period_summary(${periodId}::uuid) as summary
    `
    if (!res || !res[0] || !res[0].summary) {
      return c.json(defaultSummary)
    }

    return c.json(res[0].summary)
  } catch (err) {
    console.error('Error fetching summary:', err)
    return c.json(defaultSummary)
  }
})
