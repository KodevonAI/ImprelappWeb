import { Router } from 'express'
import { db } from '../db/client.js'
import { products, messages, categories, pageViews } from '../db/schema.js'
import { eq, count, sql } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (_req, res) => {
  const [[totalProducts], [totalCategories], [newMessages], [lowStock]] = await Promise.all([
    db.select({ count: count() }).from(products).where(eq(products.active, true)),
    db.select({ count: count() }).from(categories).where(eq(categories.active, true)),
    db.select({ count: count() }).from(messages).where(eq(messages.status, 'new')),
    db.select({ count: count() }).from(products).where(sql`${products.stock} <= 5 AND ${products.active} = true`),
  ])

  const recentMessages = await db
    .select({ id: messages.id, name: messages.name, subject: messages.subject, createdAt: messages.createdAt, status: messages.status })
    .from(messages)
    .orderBy(sql`${messages.createdAt} DESC`)
    .limit(5)

  res.json({
    totalProducts: totalProducts.count,
    totalCategories: totalCategories.count,
    newMessages: newMessages.count,
    lowStock: lowStock.count,
    recentMessages,
  })
})

// Track page view (public)
router.post('/pageview', async (req, res) => {
  const { path, referrer } = req.body
  if (path) {
    await db.insert(pageViews).values({ path, referrer: referrer ?? null })
  }
  res.status(204).send()
})

export default router
