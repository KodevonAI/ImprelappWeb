import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db/client.js'
import { orders, orderItems, products } from '../db/schema.js'
import { eq, and, ne, lt, gte, isNotNull, desc, count, inArray, sql } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'
import { sendOrderNotification } from '../lib/email.js'

const router = Router()

const creditDays: Record<string, number> = {
  credito_30: 30,
  credito_60: 60,
  credito_90: 90,
}

async function markOverdueOrders() {
  await db
    .update(orders)
    .set({ paymentStatus: 'vencido' })
    .where(
      and(
        eq(orders.paymentStatus, 'pendiente'),
        isNotNull(orders.dueDate),
        lt(orders.dueDate, new Date()),
        ne(orders.status, 'cancelado')
      )
    )
}

const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  customerAddress: z.string().min(1),
  notes: z.string().nullable().optional(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number().int().min(1) })).min(1),
})

// Public: create order
router.post('/', async (req: Request, res: Response) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    return
  }

  const { items, ...customer } = parsed.data
  const productIds = items.map((i) => i.productId)

  const foundProducts = await db
    .select({ id: products.id, name: products.name, sku: products.sku, price: products.price, active: products.active })
    .from(products)
    .where(inArray(products.id, productIds))

  const productMap = new Map(foundProducts.map((p) => [p.id, p]))
  const invalid = items.filter((i) => {
    const p = productMap.get(i.productId)
    return !p || !p.active
  })

  if (invalid.length > 0) {
    res.status(400).json({
      error: 'Uno o más productos ya no están disponibles',
      details: invalid.map((i) => i.productId),
    })
    return
  }

  const lineItems = items.map((i) => {
    const p = productMap.get(i.productId)!
    const unitPrice = Number(p.price)
    const subtotal = unitPrice * i.quantity
    return {
      productId: p.id,
      productName: p.name,
      productSku: p.sku,
      unitPrice: p.price,
      quantity: i.quantity,
      subtotal: subtotal.toFixed(2),
    }
  })

  const total = lineItems.reduce((sum, li) => sum + Number(li.subtotal), 0)

  const [order] = await db
    .insert(orders)
    .values({ ...customer, total: total.toFixed(2) })
    .returning()

  await db.insert(orderItems).values(lineItems.map((li) => ({ ...li, orderId: order.id })))

  sendOrderNotification({
    orderId: order.id,
    customerName: customer.customerName,
    customerEmail: customer.customerEmail,
    customerPhone: customer.customerPhone,
    customerAddress: customer.customerAddress,
    notes: customer.notes,
    total: order.total,
    items: lineItems.map((li) => ({
      productName: li.productName,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      subtotal: li.subtotal,
    })),
  }).catch(console.error)

  res.status(201).json({ id: order.id, message: 'Pedido creado correctamente' })
})

const createAdminOrderSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  customerAddress: z.string().min(1),
  notes: z.string().nullable().optional(),
  status: z.enum(['nuevo', 'confirmado', 'enviado', 'entregado', 'cancelado']).optional(),
  paymentTerm: z.enum(['contado', 'credito_30', 'credito_60', 'credito_90']).optional(),
  paymentStatus: z.enum(['pendiente', 'pagado', 'vencido']).optional(),
  items: z.array(z.object({ productId: z.number(), quantity: z.number().int().min(1) })).min(1),
})

// Admin: create manual order (descuenta inventario)
router.post('/admin', requireAuth, async (req: Request, res: Response) => {
  const parsed = createAdminOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    return
  }

  const { items, status, paymentTerm, paymentStatus, ...customer } = parsed.data
  const productIds = items.map((i) => i.productId)

  const foundProducts = await db
    .select({ id: products.id, name: products.name, sku: products.sku, price: products.price, stock: products.stock, active: products.active })
    .from(products)
    .where(inArray(products.id, productIds))

  const productMap = new Map(foundProducts.map((p) => [p.id, p]))
  const invalid = items.filter((i) => {
    const p = productMap.get(i.productId)
    return !p || !p.active
  })

  if (invalid.length > 0) {
    res.status(400).json({
      error: 'Uno o más productos ya no están disponibles',
      details: invalid.map((i) => i.productId),
    })
    return
  }

  const insufficient = items.filter((i) => productMap.get(i.productId)!.stock < i.quantity)
  if (insufficient.length > 0) {
    res.status(400).json({
      error: 'Stock insuficiente para uno o más productos',
      details: insufficient.map((i) => ({
        productId: i.productId,
        productName: productMap.get(i.productId)!.name,
        available: productMap.get(i.productId)!.stock,
        requested: i.quantity,
      })),
    })
    return
  }

  const lineItems = items.map((i) => {
    const p = productMap.get(i.productId)!
    const unitPrice = Number(p.price)
    const subtotal = unitPrice * i.quantity
    return {
      productId: p.id,
      productName: p.name,
      productSku: p.sku,
      unitPrice: p.price,
      quantity: i.quantity,
      subtotal: subtotal.toFixed(2),
    }
  })

  const total = lineItems.reduce((sum, li) => sum + Number(li.subtotal), 0)

  try {
    const order = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          ...customer,
          status: status ?? 'confirmado',
          paymentTerm,
          paymentStatus: paymentStatus ?? 'pendiente',
          total: total.toFixed(2),
        })
        .returning()

      await tx.insert(orderItems).values(lineItems.map((li) => ({ ...li, orderId: order.id })))

      for (const li of lineItems) {
        const [updated] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${li.quantity}` })
          .where(and(eq(products.id, li.productId), gte(products.stock, li.quantity)))
          .returning({ id: products.id })

        if (!updated) throw new Error(`Stock insuficiente para ${li.productName}`)
      }

      return order
    })

    res.status(201).json({ id: order.id, message: 'Pedido creado correctamente' })
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : 'No se pudo crear el pedido' })
  }
})

// Admin: list orders
router.get('/admin', requireAuth, async (req: Request, res: Response) => {
  await markOverdueOrders()

  const page = Math.max(1, Number(req.query.page ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20)))
  const status = req.query.status as string | undefined

  const where = status ? eq(orders.status, status as 'nuevo' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado') : undefined

  const [{ total }] = await db.select({ total: count() }).from(orders).where(where)
  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  res.json({ data: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
})

// Admin: order detail
router.get('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  await markOverdueOrders()

  const id = Number(req.params.id)
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)

  if (!order) {
    res.status(404).json({ error: 'Pedido no encontrado' })
    return
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))

  res.json({ ...order, items })
})

const updateOrderSchema = z.object({
  status: z.enum(['nuevo', 'confirmado', 'enviado', 'entregado', 'cancelado']).optional(),
  paymentTerm: z.enum(['contado', 'credito_30', 'credito_60', 'credito_90']).optional(),
  paymentStatus: z.enum(['pendiente', 'pagado', 'vencido']).optional(),
})

// Admin: update order
router.patch('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const parsed = updateOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos' })
    return
  }

  const updates: Partial<typeof orders.$inferInsert> = { ...parsed.data, updatedAt: new Date() }

  if (parsed.data.paymentTerm) {
    const days = creditDays[parsed.data.paymentTerm]
    updates.dueDate = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null
  }

  const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning()

  if (!updated) {
    res.status(404).json({ error: 'Pedido no encontrado' })
    return
  }
  res.json(updated)
})

export default router
