import { db } from './client.js'
import { admins } from './schema.js'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

async function seed() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@imprelapp.com'
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'
  const passwordHash = await bcrypt.hash(password, 12)

  await db.insert(admins).values({ email, passwordHash, name: 'Administrador' }).onConflictDoNothing()

  console.log(`Admin creado: ${email}`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
