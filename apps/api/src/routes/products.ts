import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db/client.js'
import { products, productImages, categories } from '../db/schema.js'
import { eq, ilike, and, asc, desc, count, sql } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  comparePrice: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().nullable().optional(),
  categoryId: z.number().nullable().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
})

// Public: list products with pagination + search
router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20)))
  const search = String(req.query.search ?? '')
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined
  const featured = req.query.featured === 'true'

  const conditions = [eq(products.active, true)]
  if (search) conditions.push(ilike(products.name, `%${search}%`))
  if (categoryId) conditions.push(eq(products.categoryId, categoryId))
  if (featured) conditions.push(eq(products.featured, true))

  const where = and(...conditions)

  const [{ total }] = await db.select({ total: count() }).from(products).where(where)
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      comparePrice: products.comparePrice,
      stock: products.stock,
      featured: products.featured,
      active: products.active,
      createdAt: products.createdAt,
      categoryId: products.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  res.json({
    data: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
})

// Public: single product by slug
router.get('/:slug', async (req: Request, res: Response) => {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, String(req.params.slug)), eq(products.active, true)))
    .limit(1)

  if (!product) {
    res.status(404).json({ error: 'Producto no encontrado' })
    return
  }

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(asc(productImages.order))

  const [category] = product.categoryId
    ? await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1)
    : []

  res.json({ ...product, images, category: category ?? null })
})

// Admin: create product
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    return
  }

  const [created] = await db.insert(products).values(parsed.data).returning()
  res.status(201).json(created)
})

// Admin: update product
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const parsed = productSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos' })
    return
  }

  const [updated] = await db
    .update(products)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning()

  if (!updated) {
    res.status(404).json({ error: 'Producto no encontrado' })
    return
  }
  res.json(updated)
})

// Admin: delete product
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  await db.delete(products).where(eq(products.id, id))
  res.status(204).send()
})

// Admin: upload image
router.post('/:id/images', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
  const productId = Number(req.params.id)

  if (!req.file && !req.body.url) {
    res.status(400).json({ error: 'Se requiere archivo o URL' })
    return
  }

  const url = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.url

  const [image] = await db
    .insert(productImages)
    .values({ productId, url, alt: req.body.alt ?? null, order: Number(req.body.order ?? 0) })
    .returning()

  res.status(201).json(image)
})

// Admin: delete image
router.delete('/:id/images/:imageId', requireAuth, async (req: Request, res: Response) => {
  const imageId = Number(req.params.imageId)
  const [img] = await db.select().from(productImages).where(eq(productImages.id, imageId)).limit(1)

  if (img?.url.startsWith('/uploads/')) {
    const filePath = `.${img.url}`
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }

  await db.delete(productImages).where(eq(productImages.id, imageId))
  res.status(204).send()
})

export default router
