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
