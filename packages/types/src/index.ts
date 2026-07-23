export interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  image: string | null
  description: string | null
  order: number
  active: boolean
  createdAt: string
  children?: Category[]
}

export interface ProductImage {
  id: number
  url: string
  alt: string | null
  order: number
  productId: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  price: string
  comparePrice: string | null
  stock: number
  sku: string | null
  categoryId: number | null
  featured: boolean
  active: boolean
  createdAt: string
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  images?: ProductImage[]
}

export interface CategoryPublic {
  id: number
  name: string
  slug: string
  parentId: number | null
  image: string | null
  description: string | null
  children?: CategoryPublic[]
}

export interface ProductListItemPublic {
  id: number
  name: string
  slug: string
  price: string
  comparePrice: string | null
  inStock: boolean
  featured: boolean
  categoryId: number | null
  categoryName: string | null
  categorySlug: string | null
}

export interface ProductPublic {
  id: number
  name: string
  slug: string
  description: string | null
  price: string
  comparePrice: string | null
  sku: string | null
  inStock: boolean
  categoryId: number | null
  featured: boolean
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null
  images?: ProductImage[]
}

export interface Message {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  body: string
  productId: number | null
  status: 'new' | 'read' | 'replied'
  createdAt: string
  product?: Pick<Product, 'id' | 'name' | 'slug'> | null
}

export type OrderStatus = 'nuevo' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'
export type PaymentTerm = 'contado' | 'credito_30' | 'credito_60' | 'credito_90'
export type PaymentStatus = 'pendiente' | 'pagado' | 'vencido'

export interface OrderItem {
  id: number
  orderId: number
  productId: number | null
  productName: string
  productSku: string | null
  unitPrice: string
  quantity: number
  subtotal: string
}

export interface Order {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes: string | null
  status: OrderStatus
  paymentTerm: PaymentTerm | null
  paymentStatus: PaymentStatus
  dueDate: string | null
  total: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface Admin {
  id: number
  email: string
  name: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  error: string
  message?: string
}
