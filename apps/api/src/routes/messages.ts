import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db/client.js'
import { messages, products } from '../db/schema.js'
import { eq, desc, count } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'
import { sendMessageNotification } from '../lib/email.js'

const router = Router()

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  subject: z.string().min(1),
  body: z.string().min(1),
  productId: z.number().nullable().optional(),
})

// Public: submit message
router.post('/', async (req, res) => {
  const parsed = messageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    return
  }

  const [created] = await db.insert(messages).values(parsed.data).returning()

  // Fetch product name if linked
  let productName: string | null = null
  if (parsed.data.productId) {
    const [p] = await db.select({ name: products.name }).from(products).where(eq(products.id, parsed.data.productId)).limit(1)
    productName = p?.name ?? null
  }

  // Send email notification (non-blocking)
  sendMessageNotification({
    from: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    subject: parsed.data.subject,
    body: parsed.data.body,
    productName,
  }).catch(console.error)

  res.status(201).json({ id: created.id, message: 'Mensaje enviado correctamente' })
})

// Admin: list messages
router.get('/', requireAuth, async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1))
  const pageSize = Math.min(50, Number(req.query.pageSize ?? 20))
  const status = req.query.status as string | undefined

  const rows = await db
    .select({
      id: messages.id,
      name: messages.name,
      email: messages.email,
      phone: messages.phone,
      subject: messages.subject,
      body: messages.body,
      status: messages.status,
      createdAt: messages.createdAt,
      productId: messages.productId,
      productName: products.name,
    })
    .from(messages)
    .leftJoin(products, eq(messages.productId, products.id))
    .where(status ? eq(messages.status, status as 'new' | 'read' | 'replied') : undefined)
    .orderBy(desc(messages.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  const [{ total }] = await db.select({ total: count() }).from(messages)

  res.json({ data: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
})

// Admin: update status
router.patch('/:id/status', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  const { status } = z.object({ status: z.enum(['new', 'read', 'replied']) }).parse(req.body)

  const [updated] = await db.update(messages).set({ status }).where(eq(messages.id, id)).returning()
  if (!updated) {
    res.status(404).json({ error: 'Mensaje no encontrado' })
    return
  }
  res.json(updated)
})

// Admin: delete
router.delete('/:id', requireAuth, async (req, res) => {
  await db.delete(messages).where(eq(messages.id, Number(req.params.id)))
  res.status(204).send()
})

export default router
