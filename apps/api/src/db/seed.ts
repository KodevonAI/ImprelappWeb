import { db } from './client.js'
import { admins, categories } from './schema.js'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const STARTER_CATEGORIES = [
  { name: 'Herramientas Eléctricas', slug: 'herramientas-electricas', description: 'Taladros, pulidoras, rotomartillos y más herramientas eléctricas', order: 0 },
  { name: 'Herramientas Manuales', slug: 'herramientas-manuales', description: 'Llaves, destornilladores, martillos y herramientas manuales en general', order: 1 },
  { name: 'Rodamientos', slug: 'rodamientos', description: 'Rodamientos industriales para todo tipo de maquinaria', order: 2 },
  { name: 'Cadenas', slug: 'cadenas', description: 'Cadenas de transmisión industrial', order: 3 },
  { name: 'Reductores', slug: 'reductores', description: 'Reductores de velocidad para equipos industriales', order: 4 },
  { name: 'Variadores de Velocidad', slug: 'variadores-de-velocidad', description: 'Variadores de velocidad y control de motores', order: 5 },
  { name: 'Rodillos', slug: 'rodillos', description: 'Rodillos industriales para transporte y transmisión', order: 6 },
  { name: 'Repuestos Automotrices', slug: 'repuestos-automotrices', description: 'Repuestos y partes para vehículos', order: 7 },
  { name: 'Carretillas y Equipos', slug: 'carretillas-y-equipos', description: 'Carretillas, equipo de carga y manejo de materiales', order: 8 },
  { name: 'Ferretería en General', slug: 'ferreteria-en-general', description: 'Tornillería, herrajes y demás artículos de ferretería', order: 9 },
]

async function seed() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@imprelapp.com'
  const password = process.env.ADMIN_PASSWORD ?? 'admin123'
  const passwordHash = await bcrypt.hash(password, 12)

  await db.insert(admins).values({ email, passwordHash, name: 'Administrador' }).onConflictDoNothing()
  console.log(`Admin creado: ${email}`)

  await db.insert(categories).values(STARTER_CATEGORIES).onConflictDoNothing({ target: categories.slug })
  console.log(`${STARTER_CATEGORIES.length} categorías base aseguradas`)

  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
