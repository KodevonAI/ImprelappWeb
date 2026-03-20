# Imprelapp — Documentación del Proyecto

E-commerce completo para **Imprelapp**, ferretería industrial especializada en rodamientos, piñones, correas y ferretería general.

---

## Tabla de contenidos

1. [Stack tecnológico](#1-stack-tecnológico)
2. [Configuración inicial](#2-configuración-inicial)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Base de datos — Modelo de datos](#5-base-de-datos--modelo-de-datos)
6. [Rutas de la aplicación](#6-rutas-de-la-aplicación)
7. [API REST](#7-api-rest)
8. [Sistema de autenticación](#8-sistema-de-autenticación)
9. [Carrito de compras (Zustand)](#9-carrito-de-compras-zustand)
10. [Subida de imágenes (Supabase Storage)](#10-subida-de-imágenes-supabase-storage)
11. [Paleta de colores y diseño](#11-paleta-de-colores-y-diseño)
12. [Componentes principales](#12-componentes-principales)
13. [Librerías utilitarias](#13-librerías-utilitarias)
14. [Scripts disponibles](#14-scripts-disponibles)
15. [Despliegue en Vercel](#15-despliegue-en-vercel)
16. [DNS con Hostinger](#16-dns-con-hostinger)
17. [Guía de desarrollo](#17-guía-de-desarrollo)

---

## 1. Stack tecnológico

| Capa | Tecnología | Versión | Uso |
|------|-----------|---------|-----|
| Framework | Next.js (App Router) | 14 | SSR, API routes, routing |
| Lenguaje | TypeScript | 5 | Tipado estático |
| Estilos | Tailwind CSS | 3.4 | Utility-first CSS |
| Componentes UI | Radix UI + CVA | — | Primitivos accesibles |
| Base de datos | PostgreSQL (Supabase) | — | Almacenamiento persistente |
| ORM | Prisma | 5.22 | Queries tipadas, migraciones |
| Autenticación | NextAuth.js | 4 | Sesiones JWT, Credentials |
| Estado global | Zustand | 5 | Carrito de compras |
| Formularios | React Hook Form + Zod | 7 / 3 | Validación cliente y servidor |
| Imágenes | Supabase Storage | — | Bucket público `products` |
| Despliegue | Vercel | — | CI/CD automático desde Git |

---

## 2. Configuración inicial

### Prerrequisitos

- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com) (gratis)
- Una cuenta en [Vercel](https://vercel.com) (gratis)

### Pasos para arrancar en local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
cp .env.example .env.local
# → Editar .env.local con tus credenciales reales (ver sección 3)

# 3. Generar el cliente de Prisma
npx prisma generate

# 4. Crear las tablas en la base de datos
npm run db:migrate

# 5. Poblar la base de datos con datos de ejemplo
npm run db:seed

# 6. Arrancar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

**Credenciales del admin (tras el seed):**
- Email: `admin@imprelapp.com`
- Contraseña: `admin123`

---

## 3. Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# ─── Base de datos Supabase ────────────────────────────────────────────────
# Usar el Transaction Pooler para la URL principal (puerto 6543)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Usar la Direct Connection para migraciones de Prisma (puerto 5432)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ─── NextAuth ──────────────────────────────────────────────────────────────
# Generar con: openssl rand -base64 32
NEXTAUTH_SECRET="tu-secreto-aleatorio-de-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
# En producción: NEXTAUTH_URL="https://tu-dominio.com"

# ─── Supabase Storage ──────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."  # Solo para el servidor (subida de imágenes)
```

### ¿Dónde encontrar cada valor en Supabase?

| Variable | Ubicación en Supabase |
|----------|----------------------|
| `DATABASE_URL` | Project Settings → Database → Transaction Pooler → URI |
| `DIRECT_URL` | Project Settings → Database → Direct connection → URI |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon / public |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role (mantener privado) |

> **Importante:** Las variables prefijadas con `NEXT_PUBLIC_` son visibles en el cliente (navegador). Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend.

---

## 4. Estructura del proyecto

```
ImprelappWeb/
├── prisma/
│   ├── schema.prisma          # Modelos de la base de datos
│   └── seed.ts                # Script de datos iniciales
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Layout raíz (SessionProvider + Toaster)
│   │   ├── not-found.tsx      # Página 404 global
│   │   ├── globals.css        # Variables CSS de shadcn/ui + Tailwind
│   │   │
│   │   ├── (store)/           # Grupo: tienda pública (con Header/Footer)
│   │   │   ├── layout.tsx     # Shell: Header + Footer + CartDrawer
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── productos/
│   │   │   │   ├── page.tsx           # Catálogo con filtros
│   │   │   │   └── [slug]/page.tsx    # Detalle de producto
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx           # Formulario de checkout
│   │   │   └── confirmacion/
│   │   │       └── [orderId]/page.tsx # Confirmación de pedido
│   │   │
│   │   ├── (admin)/           # Grupo: panel admin (protegido)
│   │   │   ├── layout.tsx     # Shell admin: Sidebar + Header
│   │   │   └── admin/
│   │   │       ├── page.tsx                        # Dashboard con stats
│   │   │       ├── productos/
│   │   │       │   ├── page.tsx                    # Lista de productos
│   │   │       │   ├── nuevo/page.tsx              # Crear producto
│   │   │       │   └── [id]/editar/page.tsx        # Editar producto
│   │   │       ├── categorias/
│   │   │       │   └── page.tsx                    # CRUD categorías
│   │   │       └── pedidos/
│   │   │           ├── page.tsx                    # Lista de pedidos
│   │   │           └── [id]/page.tsx               # Detalle + cambiar estado
│   │   │
│   │   ├── auth/
│   │   │   └── signin/page.tsx    # Página de login
│   │   │
│   │   └── api/               # API Routes (REST)
│   │       ├── [...nextauth]/ # Endpoints de NextAuth
│   │       ├── products/      # GET, POST + [id]: GET, PUT, DELETE
│   │       │   └── [id]/images/ # POST (guardar URLs de imágenes)
│   │       ├── categories/    # GET, POST + [id]: PUT, DELETE
│   │       ├── orders/        # GET (admin), POST (pública) + [id]: GET, PUT
│   │       └── upload/        # POST (subir imagen a Supabase Storage)
│   │
│   ├── components/
│   │   ├── ui/                # Componentes base (Button, Input, Badge, etc.)
│   │   ├── store/             # Componentes de la tienda
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── AddToCartButton.tsx
│   │   ├── admin/             # Componentes del panel admin
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   ├── OrderStatusUpdater.tsx
│   │   │   ├── OrderStatusFilter.tsx
│   │   │   └── DeleteProductButton.tsx
│   │   └── shared/
│   │       └── SessionProvider.tsx  # Wrapper de NextAuth para el cliente
│   │
│   ├── hooks/
│   │   └── use-toast.ts       # Hook para notificaciones toast
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Singleton del cliente Prisma
│   │   ├── auth.ts            # Configuración de NextAuth
│   │   ├── supabase.ts        # Cliente Supabase + función de upload
│   │   ├── utils.ts           # cn(), formatCurrency(), slugify(), etc.
│   │   └── validations.ts     # Esquemas Zod compartidos
│   │
│   ├── store/
│   │   └── cartStore.ts       # Estado global del carrito (Zustand)
│   │
│   └── middleware.ts          # Protección Edge de /admin/*
│
├── .env.example               # Plantilla de variables de entorno
├── .env.local                 # Variables locales (NO commitear)
├── next.config.mjs            # Configuración de Next.js
├── tailwind.config.ts         # Colores de marca + plugins
├── tsconfig.json              # Configuración TypeScript
└── package.json               # Dependencias y scripts
```

---

## 5. Base de datos — Modelo de datos

El schema completo está en `prisma/schema.prisma`.

### Diagrama de relaciones

```
User          Category
  │               │
  │           1:N │
  │           Product ──── 1:N ──── ProductImage
  │               │
  │           1:N │
Order ──── 1:N ── OrderItem
```

### Modelos

#### `User`
Administradores del panel. Solo se crean via seed o directamente en DB.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (cuid) | PK |
| `email` | String (unique) | Email de login |
| `password` | String | Hash bcrypt (rounds: 12) |
| `name` | String? | Nombre visible |
| `role` | Enum `Role` | `ADMIN` o `SUPER_ADMIN` |

#### `Category`
Agrupa productos. Referenciada en filtros del catálogo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (cuid) | PK |
| `name` | String | Nombre visible |
| `slug` | String (unique) | URL amigable, auto-generado |
| `description` | String? | Descripción opcional |
| `imageUrl` | String? | URL de imagen (Supabase Storage) |
| `active` | Boolean | Si aparece en la tienda |

#### `Product`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (cuid) | PK |
| `name` | String | Nombre del producto |
| `slug` | String (unique) | URL amigable, auto-generado del nombre |
| `description` | String? | Descripción larga |
| `price` | Decimal(10,2) | Precio en COP |
| `stock` | Int | Unidades disponibles |
| `sku` | String? (unique) | Código interno |
| `featured` | Boolean | Aparece en homepage |
| `active` | Boolean | Visible en tienda |
| `categoryId` | String | FK → Category |

#### `ProductImage`
Galería de imágenes por producto. El `order` determina el orden de visualización (0 = principal).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (cuid) | PK |
| `url` | String | URL pública en Supabase Storage |
| `order` | Int | Posición (0 = imagen principal) |
| `productId` | String | FK → Product (cascade delete) |

#### `Order`
Pedido creado por un cliente desde el checkout.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | String (cuid) | PK |
| `orderNumber` | String (unique) | Formato `IMP-2024-XXXX` |
| `status` | Enum `OrderStatus` | Estado actual del pedido |
| `total` | Decimal(10,2) | Total del pedido en COP |
| `customerName` | String | Nombre del cliente |
| `customerEmail` | String | Email del cliente |
| `customerPhone` | String? | Teléfono opcional |
| `addressStreet` | String? | Dirección de entrega |
| `addressCity` | String? | Ciudad |
| `addressState` | String? | Departamento |
| `notes` | String? | Notas del cliente |

#### `OrderItem`
Snapshot del producto en el momento de la compra. Si el producto se elimina, el ítem conserva el nombre y precio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `productName` | String | Nombre del producto al momento de comprar |
| `unitPrice` | Decimal | Precio unitario al momento de comprar |
| `subtotal` | Decimal | `unitPrice × quantity` |
| `productId` | String? | FK nullable → Product (SetNull on delete) |

#### Enums

```prisma
enum Role         { ADMIN, SUPER_ADMIN }
enum OrderStatus  { PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED }
```

---

## 6. Rutas de la aplicación

### Tienda pública (`src/app/(store)/`)

| Ruta | Componente | Tipo | Descripción |
|------|-----------|------|-------------|
| `/` | `(store)/page.tsx` | Server | Homepage: hero, categorías, productos destacados, about |
| `/productos` | `(store)/productos/page.tsx` | Server | Catálogo con filtros por URL params |
| `/productos/[slug]` | `(store)/productos/[slug]/page.tsx` | Server | Detalle de producto |
| `/checkout` | `(store)/checkout/page.tsx` | Client | Formulario de checkout |
| `/confirmacion/[orderId]` | `(store)/confirmacion/[orderId]/page.tsx` | Server | Confirmación post-compra |

**Parámetros de filtro del catálogo** (`/productos`):

| Param | Tipo | Ejemplo |
|-------|------|---------|
| `categoria` | slug | `?categoria=rodamientos` |
| `busqueda` | texto | `?busqueda=6205` |
| `minPrecio` | número | `?minPrecio=10000` |
| `maxPrecio` | número | `?maxPrecio=50000` |
| `pagina` | número | `?pagina=2` |

### Panel admin (`src/app/(admin)/admin/`)

Todas las rutas admin requieren sesión activa. Doble protección: Edge middleware + `getServerSession` en el layout.

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | `admin/page.tsx` | Dashboard: stats + pedidos recientes |
| `/admin/productos` | `admin/productos/page.tsx` | Lista de todos los productos |
| `/admin/productos/nuevo` | `admin/productos/nuevo/page.tsx` | Crear nuevo producto |
| `/admin/productos/[id]/editar` | `admin/productos/[id]/editar/page.tsx` | Editar producto existente |
| `/admin/categorias` | `admin/categorias/page.tsx` | CRUD de categorías |
| `/admin/pedidos` | `admin/pedidos/page.tsx` | Lista de pedidos (filtro por estado) |
| `/admin/pedidos/[id]` | `admin/pedidos/[id]/page.tsx` | Detalle + cambiar estado del pedido |

### Auth

| Ruta | Descripción |
|------|-------------|
| `/auth/signin` | Página de login (fuera de ambos grupos de layout) |

---

## 7. API REST

Todas las rutas mutantes (`POST`, `PUT`, `DELETE`) verifican sesión con `getServerSession` antes de ejecutar. Solo `POST /api/orders` es pública.

### Productos

```
GET  /api/products                  # Lista productos activos
     ?categoria=slug                # Filtrar por categoría
     ?featured=true                 # Solo destacados
     ?limit=50                      # Máximo de resultados

POST /api/products                  # Crear producto (admin)
     Body: { name, description, price, stock, sku, featured, active, categoryId }

GET  /api/products/[id]             # Obtener producto por ID
PUT  /api/products/[id]             # Actualizar producto (admin)
DELETE /api/products/[id]           # Eliminar producto (admin)

POST /api/products/[id]/images      # Guardar URLs de imágenes (admin)
     Body: { urls: string[] }
```

### Categorías

```
GET  /api/categories                # Lista categorías activas (con conteo de productos)
POST /api/categories                # Crear categoría (admin)
     Body: { name, description, active }

PUT  /api/categories/[id]           # Actualizar categoría (admin)
DELETE /api/categories/[id]         # Eliminar categoría (admin)
```

### Pedidos

```
GET  /api/orders                    # Lista pedidos (admin)
     ?status=PENDING                # Filtrar por estado
     ?page=1&limit=20               # Paginación

POST /api/orders                    # Crear pedido (pública — desde checkout)
     Body: {
       customerName, customerEmail, customerPhone?,
       addressStreet?, addressCity?, addressState?,
       notes?,
       total,
       items: [{ productId, quantity, unitPrice, productName }]
     }

GET  /api/orders/[id]               # Detalle de pedido (admin)
PUT  /api/orders/[id]               # Cambiar estado (admin)
     Body: { status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
```

### Upload

```
POST /api/upload                    # Subir imagen a Supabase Storage (admin)
     Form-data: { file: File, productId: string }
     Response: { url: string }
```

---

## 8. Sistema de autenticación

### Flujo

1. El usuario accede a `/auth/signin` e ingresa email + contraseña.
2. NextAuth valida contra la tabla `users` usando `bcryptjs.compare`.
3. Si es válido, genera un **JWT** con `{ id, email, name, role }`.
4. La sesión se guarda en una cookie HttpOnly firmada.

### Protección de rutas admin — doble capa

**Capa 1 — Edge Middleware** (`src/middleware.ts`):
- Se ejecuta antes de cargar cualquier archivo de `/admin/*`.
- Verifica el token JWT en la cookie de NextAuth.
- Si no hay token, redirige inmediatamente a `/auth/signin`.
- Es la protección más eficiente (no llega a renderizar nada).

**Capa 2 — Server Component** (`src/app/(admin)/layout.tsx`):
- Llama a `getServerSession(authOptions)` en el servidor.
- Si no hay sesión, redirige con `redirect("/auth/signin")`.
- Actúa como segunda línea de defensa.

**Capa 3 — API Routes**:
- Cada endpoint mutante llama a `getServerSession` antes de ejecutar.
- Devuelve `401 No autorizado` si no hay sesión.

### Archivos clave

```
src/lib/auth.ts          # authOptions: provider, callbacks JWT/session
src/middleware.ts        # Protección Edge con withAuth()
```

### Cambiar contraseña de admin

Nunca guardes contraseñas en texto plano. Para crear o cambiar el admin:

```typescript
import { hash } from "bcryptjs";
const hashed = await hash("nueva-contraseña", 12);
// Luego: prisma.user.update({ where: { email: "..." }, data: { password: hashed } })
```

---

## 9. Carrito de compras (Zustand)

**Archivo:** `src/store/cartStore.ts`

El carrito persiste en `localStorage` con la key `imprelapp-cart`. Sobrevive a recargas de página.

### API del store

```typescript
const { items, isOpen, addItem, removeItem, updateQuantity,
        clearCart, toggleCart, openCart, closeCart,
        totalItems, totalPrice } = useCartStore();
```

| Método/Propiedad | Tipo | Descripción |
|-----------------|------|-------------|
| `items` | `CartItem[]` | Lista de productos en el carrito |
| `isOpen` | `boolean` | Estado del drawer del carrito |
| `addItem(item)` | función | Agrega 1 unidad; si ya existe, incrementa cantidad |
| `removeItem(id)` | función | Elimina el producto completamente |
| `updateQuantity(id, qty)` | función | Cambia cantidad; si qty ≤ 0, elimina |
| `clearCart()` | función | Vacía el carrito |
| `totalItems()` | `() => number` | Suma de todas las cantidades |
| `totalPrice()` | `() => number` | Suma de `precio × cantidad` |

### Estructura de `CartItem`

```typescript
interface CartItem {
  id: string;       // ID del producto en BD
  name: string;
  price: number;    // Precio al momento de agregar
  quantity: number;
  image?: string;   // URL de imagen principal
  slug: string;     // Para enlazar al detalle
}
```

---

## 10. Subida de imágenes (Supabase Storage)

### Configuración del bucket

1. En Supabase → Storage → crear bucket llamado **`products`**.
2. Marcarlo como **público** (Public bucket).
3. No se necesita configuración adicional de políticas para lectura pública.

### Flujo de subida

```
Usuario selecciona imagen en ProductForm
  → fetch POST /api/upload (multipart/form-data)
  → API route usa supabaseServiceRole para subir
  → Retorna { url: "https://xxxx.supabase.co/storage/v1/object/public/products/..." }
  → URL se guarda en ProductImage.url en la BD
```

### Organización de archivos en el bucket

```
products/
  [productId]/
    1711234567890.jpg
    1711234567891.png
  new/
    1711234567892.webp   ← Temporales antes de guardar el producto
```

### Clientes

```typescript
// Cliente público (navegador) — src/lib/supabase.ts
import { supabase } from "@/lib/supabase";

// Cliente con service role (servidor) — solo en API routes
import { createServerSupabaseClient } from "@/lib/supabase";
const supabase = createServerSupabaseClient();
```

---

## 11. Paleta de colores y diseño

### Colores de marca

| Nombre | Hex | Uso |
|--------|-----|-----|
| Navy | `#1B3A6B` | Headers, sidebar, textos principales, botón default |
| Blue | `#2563EB` | Links, badges informativos, hover |
| Orange | `#F97316` | CTAs (Agregar al carrito, Confirmar pedido), badges destacados |
| White | `#FFFFFF` | Fondo principal |
| Gray | `#F9FAFB` | Fondo de cards y secciones alternas |

### Uso en Tailwind

Los colores están definidos en `tailwind.config.ts` bajo `theme.extend.colors`:

```typescript
// Usar directamente por hex (más explícito):
className="bg-[#1B3A6B] text-white"
className="bg-[#F97316] hover:bg-[#EA6C0D]"

// O usar las clases de marca:
className="bg-brand-navy text-white"
className="text-brand-orange"
```

### Variantes del componente Button

```tsx
<Button variant="default">   // Azul navy
<Button variant="orange">    // Naranja — para CTAs principales
<Button variant="outline">   // Borde navy, fondo blanco
<Button variant="ghost">     // Sin fondo
<Button variant="link">      // Solo texto azul
```

---

## 12. Componentes principales

### Tienda

#### `<Header />`
- Sticky en la parte superior con z-index 40.
- Muestra logo, navegación, y botón de carrito con badge de conteo.
- Menú hamburguesa en mobile.
- Usa `useCartStore` para el conteo y abrir el CartDrawer.

#### `<CartDrawer />`
- Panel lateral derecho que se superpone al contenido.
- Se activa con `useCartStore().isOpen`.
- Permite ajustar cantidades, eliminar ítems, y navegar al checkout.

#### `<ProductCard />`
- Card reutilizable para el catálogo y la homepage.
- Al hacer clic en "Agregar al carrito" llama a `addItem` y abre el drawer.
- Muestra badge "Agotado" si `stock === 0`.

#### `<ProductFilters />`
- Barra lateral en la página de catálogo.
- Componente cliente que manipula la URL con `useRouter`.
- Filtros: búsqueda de texto, categoría, rango de precios.

### Admin

#### `<ProductForm />`
- Formulario unificado para crear y editar productos.
- Recibe `initialData` para modo edición.
- Maneja upload de imágenes internamente antes de enviar el formulario.
- Usa `react-hook-form` + Zod para validación.

#### `<CategoryManager />`
- Panel de dos columnas: lista de categorías + formulario inline.
- Operaciones CRUD sin salir de la página.

#### `<OrderStatusUpdater />`
- Select + botón para cambiar el estado de un pedido.
- Llama a `PUT /api/orders/[id]` y refresca la página.

---

## 13. Librerías utilitarias

**Archivo:** `src/lib/utils.ts`

```typescript
// Combina clases de Tailwind sin conflictos
cn(...inputs: ClassValue[]): string

// Formatea número a moneda colombiana
// Ejemplo: 12500 → "$12.500"
formatCurrency(amount: number | string | Decimal): string

// Convierte texto a slug URL-friendly
// Ejemplo: "Rodamiento 6205-2RS" → "rodamiento-6205-2rs"
slugify(text: string): string

// Genera número de pedido único
// Ejemplo: "IMP-2024-4821"
generateOrderNumber(): string
```

**Archivo:** `src/lib/validations.ts`

Esquemas Zod usados tanto en el cliente (React Hook Form) como en el servidor (API routes):

```typescript
checkoutSchema    // Formulario de checkout
productSchema     // Formulario de producto
categorySchema    // Formulario de categoría
loginSchema       // Formulario de login
```

---

## 14. Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo en localhost:3000
npm run build        # Build de producción
npm run start        # Servir el build de producción
npm run lint         # ESLint

npm run db:push      # Sincronizar schema sin generar migración (dev rápido)
npm run db:migrate   # Crear y aplicar migración (recomendado para producción)
npm run db:seed      # Poblar BD con datos de prueba
npm run db:studio    # Abrir Prisma Studio (GUI de la BD)
```

---

## 15. Despliegue en Vercel

### Primera vez

1. Hacer push del repositorio a GitHub.
2. En Vercel → Add New Project → importar el repositorio.
3. Vercel detecta automáticamente que es un proyecto Next.js.
4. En **Environment Variables**, agregar todas las variables del `.env.local` (con `NEXTAUTH_URL` apuntando al dominio de producción).
5. Click en **Deploy**.

### Variables de entorno en Vercel

Ir a: Project → Settings → Environment Variables

Agregar todas las variables del `.env.local`:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → `https://tu-dominio.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Re-despliegues

Cada push a la rama `main` activa un nuevo deploy automáticamente.

---

## 16. DNS con Hostinger

Para apuntar un dominio de Hostinger al sitio desplegado en Vercel:

1. **En Vercel**: Project → Settings → Domains → agregar tu dominio (ej: `imprelapp.com`).
2. Vercel mostrará un valor CNAME, generalmente `cname.vercel-dns.com`.
3. **En Hostinger**: Panel de control → DNS / Zona DNS → agregar registro:

| Tipo | Nombre | Valor |
|------|--------|-------|
| `CNAME` | `www` | `cname.vercel-dns.com` |
| `A` | `@` | IP proporcionada por Vercel |

4. Esperar propagación DNS (hasta 48h, usualmente minutos).
5. Vercel gestiona el certificado SSL automáticamente (Let's Encrypt).

---

## 17. Guía de desarrollo

### Convenciones

- **Server Components** por defecto: todo lo que no necesite interactividad del cliente.
- **`"use client"`** solo cuando se necesite: hooks (`useState`, `useEffect`, `useRouter`, stores de Zustand).
- **Slugs auto-generados**: nunca pedir el slug al usuario, siempre derivarlo del nombre con `slugify()`.
- **Precios**: siempre almacenar como `Decimal` en BD, convertir a `number` con `.toNumber()` al usar en JS.

### Agregar un nuevo modelo a la BD

1. Editar `prisma/schema.prisma` con el nuevo modelo.
2. Ejecutar `npm run db:migrate` y dar un nombre a la migración.
3. Crear la API route en `src/app/api/[recurso]/route.ts`.
4. Si es admin-only, verificar sesión con `getServerSession`.

### Agregar un campo a un modelo existente

1. Agregar el campo en `prisma/schema.prisma`.
2. Ejecutar `npm run db:migrate`.
3. Actualizar el esquema Zod en `src/lib/validations.ts`.
4. Actualizar los formularios y API routes afectados.

### Agregar una nueva ruta de admin

1. Crear la carpeta en `src/app/(admin)/admin/[nueva-ruta]/`.
2. Agregar el `page.tsx` (Server Component por defecto).
3. Agregar el enlace en `src/components/admin/AdminSidebar.tsx` en el array `navItems`.

### Flujo completo de un pedido

```
Cliente llena checkout form
  → POST /api/orders
  → BD: Order + OrderItems creados (status: PENDING)
  → Redirect a /confirmacion/[orderId]
  → Admin ve pedido en /admin/pedidos
  → Admin cambia status → PUT /api/orders/[id]
  → Estado actualizado en BD
```

### Debugging común

| Problema | Causa probable | Solución |
|---------|---------------|----------|
| `Error: Tenant not found` | DATABASE_URL incorrecta o vacía | Verificar `.env.local` |
| Imágenes no cargan | Bucket no es público | Supabase → Storage → bucket `products` → Public |
| Login falla | NEXTAUTH_SECRET no configurado | Agregar a `.env.local` |
| `/admin` redirige al login | Middleware correcto | Iniciar sesión primero en `/auth/signin` |
| Slug duplicado al crear producto | SKU o nombre repetido | Cambiar el nombre o agregar sufijo único |

---

*Documentación generada para el proyecto Imprelapp Web — 2024.*
