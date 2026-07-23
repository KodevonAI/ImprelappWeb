import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRouter from './routes/auth.js'
import categoriesRouter from './routes/categories.js'
import productsRouter from './routes/products.js'
import messagesRouter from './routes/messages.js'
import dashboardRouter from './routes/dashboard.js'
import ordersRouter from './routes/orders.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.WEB_URL ?? 'http://localhost:3000', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images
const uploadDir = process.env.UPLOAD_DIR ?? path.join(__dirname, '../../uploads')
app.use('/uploads', express.static(uploadDir))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/products', productsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/orders', ordersRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
