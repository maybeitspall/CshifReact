import { Hono } from 'hono'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { periodsRoute } from './routes/periods'
import { daysRoute } from './routes/days'
import { activitiesRoute } from './routes/activities'
import { obstaclesRoute } from './routes/obstacles'
import { synthesesRoute } from './routes/syntheses'
import { summaryRoute } from './routes/summary'
import { obstacleCategoriesRoute } from './routes/categories'

export const app = new Hono().basePath('/api')

// Trim trailing slashes globally
app.use(trimTrailingSlash())

// Auth / Secret Protection Middleware
app.use('*', async (c, next) => {
  // Allow OPTIONS preflight
  if (c.req.method === 'OPTIONS') return next()

  const secret = process.env.API_SECRET || process.env.VITE_API_SECRET
  if (secret) {
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '')
    if (token !== secret) {
      return c.json({ error: 'Unauthorized: invalid or missing API secret' }, 401)
    }
  }
  await next()
})

// Sub-routes
app.route('/periods', periodsRoute)
app.route('/days', daysRoute)
app.route('/activities', activitiesRoute)
app.route('/obstacles', obstaclesRoute)
app.route('/obstacle-categories', obstacleCategoriesRoute)
app.route('/syntheses', synthesesRoute)
app.route('/summary', summaryRoute)

export default app
