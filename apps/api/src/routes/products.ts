import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db/client.js'
import { products, productImages, categories } from '../db/schema.js'
import { eq, ilike, and, asc, desc, count, sql, inArray } from 'drizzle-orm'
import { requireAuth } from '../middleware/auth.js'
import { parseCsv } from '../lib/csv.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

const router = Router()

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

async function saveCompressedImage(buffer: Buffer): Promise<string> {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`
  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(path.join(UPLOAD_DIR, filename))
  return filename
}

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  comparePrice: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().trim().min(1, 'El SKU es obligatorio'),
  categoryId: z.number().int().positive('La categoría es obligatoria'),
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

  const firstImageByProduct = new Map<number, string>()
  if (rows.length > 0) {
    const images = await db
      .select({ productId: productImages.productId, url: productImages.url, order: productImages.order })
      .from(productImages)
      .where(inArray(productImages.productId, rows.map((r) => r.id)))
      .orderBy(asc(productImages.order))
    for (const img of images) {
      if (!firstImageByProduct.has(img.productId)) firstImageByProduct.set(img.productId, img.url)
    }
  }

  res.json({
    data: rows.map(({ stock, ...row }) => ({
      ...row,
      inStock: stock > 0,
      image: firstImageByProduct.get(row.id) ?? null,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
})

// Admin: list products (all statuses, full fields) — must be mounted before GET /:slug
router.get('/admin', requireAuth, async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20)))
  const search = String(req.query.search ?? '')

  const conditions = search ? [ilike(products.name, `%${search}%`)] : []
  const where = conditions.length ? and(...conditions) : undefined

  const [{ total }] = await db.select({ total: count() }).from(products).where(where)
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      stock: products.stock,
      active: products.active,
      featured: products.featured,
      createdAt: products.createdAt,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  res.json({ data: rows, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
})

// Admin: downloadable CSV template for bulk import
router.get('/template', requireAuth, (_req: Request, res: Response) => {
  const header = 'nombre,slug,descripcion,precio,precio_comparacion,stock,sku,categoria,destacado,activo'
  const example = 'Taladro Percutor 1/2" 750W,taladro-percutor-750w,Taladro percutor profesional con maletin,189000,220000,15,TLD-750,herramientas-electricas,no,si'
  const csv = `${header}\n${example}\n`
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="template-productos.csv"')
  res.send(csv)
})

function slugifyName(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseCsvBoolean(v: string | undefined, defaultVal: boolean): boolean {
  if (v === undefined || v.trim() === '') return defaultVal
  return ['true', '1', 'si', 'sí', 'yes'].includes(v.trim().toLowerCase())
}

const MONEY_RE = /^\d+(\.\d{1,2})?$/

// Admin: bulk create products from CSV text
router.post('/bulk-import', requireAuth, async (req: Request, res: Response) => {
  const csv = String(req.body.csv ?? '')
  if (!csv.trim()) {
    res.status(400).json({ error: 'CSV vacío' })
    return
  }

  const rows = parseCsv(csv)
  if (rows.length < 2) {
    res.status(400).json({ error: 'El CSV no tiene filas de datos' })
    return
  }

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (col: string) => header.indexOf(col)
  const iName = idx('nombre')
  const iSlug = idx('slug')
  const iDesc = idx('descripcion')
  const iPrice = idx('precio')
  const iComparePrice = idx('precio_comparacion')
  const iStock = idx('stock')
  const iSku = idx('sku')
  const iCategory = idx('categoria')
  const iFeatured = idx('destacado')
  const iActive = idx('activo')

  if (iName === -1 || iPrice === -1) {
    res.status(400).json({ error: 'El CSV debe tener columnas "nombre" y "precio"' })
    return
  }

  const allCategories = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
  const categoryBySlug = new Map(allCategories.map((c) => [c.slug.toLowerCase(), c.id]))
  const categoryByName = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]))

  let created = 0
  const errors: Array<{ row: number; message: string }> = []

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r]
    if (cols.every((c) => c.trim() === '')) continue
    const rowNum = r + 1

    const name = cols[iName]?.trim()
    const priceRaw = cols[iPrice]?.trim()

    if (!name) {
      errors.push({ row: rowNum, message: 'Falta el nombre' })
      continue
    }
    if (!priceRaw || !MONEY_RE.test(priceRaw)) {
      errors.push({ row: rowNum, message: `Precio inválido: "${priceRaw ?? ''}"` })
      continue
    }

    const slug = (iSlug !== -1 && cols[iSlug]?.trim()) || slugifyName(name)
    const comparePriceRaw = iComparePrice !== -1 ? cols[iComparePrice]?.trim() : ''
    const stockRaw = iStock !== -1 ? cols[iStock]?.trim() : ''
    const categoryRaw = iCategory !== -1 ? cols[iCategory]?.trim().toLowerCase() : ''

    const categoryId = categoryRaw
      ? categoryBySlug.get(categoryRaw) ?? categoryByName.get(categoryRaw) ?? null
      : null

    try {
      await db.insert(products).values({
        name,
        slug,
        description: iDesc !== -1 ? cols[iDesc]?.trim() || null : null,
        price: priceRaw,
        comparePrice: comparePriceRaw && MONEY_RE.test(comparePriceRaw) ? comparePriceRaw : null,
        stock: stockRaw ? Math.max(0, parseInt(stockRaw, 10) || 0) : 0,
        sku: iSku !== -1 ? cols[iSku]?.trim() || null : null,
        categoryId,
        featured: parseCsvBoolean(iFeatured !== -1 ? cols[iFeatured] : undefined, false),
        active: parseCsvBoolean(iActive !== -1 ? cols[iActive] : undefined, true),
      })
      created++
    } catch {
      errors.push({ row: rowNum, message: `Ya existe un producto con ese slug o SKU: "${slug}"` })
    }
  }

  res.json({ created, errors })
})

// Admin: single product by numeric id (any status)
router.get('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)

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

// Public: single product by slug
router.get('/:slug', async (req: Request, res: Response) => {
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      comparePrice: products.comparePrice,
      sku: products.sku,
      stock: products.stock,
      categoryId: products.categoryId,
      featured: products.featured,
    })
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
    ? await db
        .select({ id: categories.id, name: categories.name, slug: categories.slug })
        .from(categories)
        .where(eq(categories.id, product.categoryId))
        .limit(1)
    : []

  const { stock, ...publicProduct } = product
  res.json({ ...publicProduct, inStock: stock > 0, images, category: category ?? null })
})

function duplicateFieldMessage(err: unknown): string | null {
  const constraint = (err as { constraint?: string })?.constraint ?? ''
  if ((err as { code?: string })?.code !== '23505') return null
  if (constraint.includes('sku')) return 'Ya existe un producto con ese SKU'
  if (constraint.includes('slug')) return 'Ya existe un producto con ese slug'
  return 'Ya existe un producto con ese valor único'
}

// Admin: create product
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() })
    return
  }

  try {
    const [created] = await db.insert(products).values(parsed.data).returning()
    res.status(201).json(created)
  } catch (err) {
    const message = duplicateFieldMessage(err)
    if (!message) throw err
    res.status(409).json({ error: message })
  }
})

// Admin: update product
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = Number(req.params.id)
  const parsed = productSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos' })
    return
  }

  try {
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
  } catch (err) {
    const message = duplicateFieldMessage(err)
    if (!message) throw err
    res.status(409).json({ error: message })
  }
})

// Admin: bulk delete products
const bulkDeleteSchema = z.object({ ids: z.array(z.number().int().positive()).min(1) })

router.delete('/', requireAuth, async (req: Request, res: Response) => {
  const parsed = bulkDeleteSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'IDs inválidos' })
    return
  }

  await db.delete(products).where(inArray(products.id, parsed.data.ids))
  res.status(204).send()
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
    ? `/uploads/${await saveCompressedImage(req.file.buffer)}`
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
