import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/client.js'
import { categories } from '../db/schema.js'
import { eq, isNull, asc } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  parentId: z.number().nullable().optional(),
  image: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
})

const publicColumns = {
  id: categories.id,
  name: categories.name,
  slug: categories.slug,
  parentId: categories.parentId,
  image: categories.image,
  description: categories.description,
}

// Public: get all active categories, as a tree
router.get('/', async (_req, res) => {
  const all = await db
    .select(publicColumns)
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.order), asc(categories.name))

  // Build tree
  const map = new Map(all.map((c) => [c.id, { ...c, children: [] as typeof all }]))
  const roots: typeof all = []

  for (const cat of map.values()) {
    if (cat.parentId) {
      map.get(cat.parentId)?.children.push(cat)
    } else {
      roots.push(cat)
    }
  }

  res.json(roots)
})

// Public: flat list of active categories (for selects/breadcrumbs)
router.get('/flat', async (_req, res) => {
  const all = await db
    .select(publicColumns)
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.order), asc(categories.name))
  res.json(all)
})

// Admin: full tree, all statuses
router.get('/admin', requireAuth, async (_req, res) => {
  const all = await db.select().from(categories).orderBy(asc(categories.order), asc(categories.name))

  const map = new Map(all.map((c) => [c.id, { ...c, children: [] as typeof all }]))
  const roots: typeof all = []

  for (const cat of map.values()) {
    if (cat.parentId) {
      map.get(cat.parentId)?.children.push(cat)
    } else {
      roots.push(cat)
    }
  }

  res.json(roots)
})

// Admin: full flat list, all statuses
router.get('/admin/flat', requireAuth, async (_req, res) => {
  const all = await db.select().from(categories).orderBy(asc(categories.order), asc(categories.name))
  res.json(all)
})

// Admin: create
router.post('/', requireAuth, async (req, res) => {
  const parsed = categorySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    return
  }

  const [created] = await db.insert(categories).values(parsed.data).returning()
  res.status(201).json(created)
})

// Admin: update
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const parsed = categorySchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos' })
    return
  }

  const [updated] = await db.update(categories).set(parsed.data).where(eq(categories.id, id)).returning()
  if (!updated) {
    res.status(404).json({ error: 'Categoría no encontrada' })
    return
  }
  res.json(updated)
})

// Admin: delete
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  await db.delete(categories).where(eq(categories.id, id))
  res.status(204).send()
})

export default router
