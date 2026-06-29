import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '../db/client.js'
import { admins } from '../db/schema.js'
import { signToken } from '../lib/jwt.js'
import { eq } from 'drizzle-orm'
import { requireAuth, AuthRequest } from '../middleware/auth.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos' })
    return
  }

  const { email, password } = parsed.data
  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1)

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }

  const token = signToken({ adminId: admin.id, email: admin.email })
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } })
})

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const [admin] = await db
    .select({ id: admins.id, email: admins.email, name: admins.name })
    .from(admins)
    .where(eq(admins.id, req.adminId!))
    .limit(1)

  if (!admin) {
    res.status(404).json({ error: 'Admin no encontrado' })
    return
  }

  res.json(admin)
})

export default router
