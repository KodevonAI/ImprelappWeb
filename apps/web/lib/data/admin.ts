import 'server-only'
import { serverGet } from '@/lib/server-api'
import type { Product, ProductImage, Category, Message, Order, PaginatedResponse } from '@imprelapp/types'

export interface AdminProductListItem {
  id: number
  name: string
  slug: string
  price: string
  stock: number
  active: boolean
  featured: boolean
  categoryId: number | null
  categoryName: string | null
  createdAt: string
}

export type AdminProductDetail = Product & {
  images: ProductImage[]
  category: Pick<Category, 'id' | 'name' | 'slug'> | null
}

export type CategoryWithChildren = Category & { children?: CategoryWithChildren[] }

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  newMessages: number
  lowStock: number
  recentMessages: Array<{
    id: number
    name: string
    subject: string
    createdAt: string
    status: 'new' | 'read' | 'replied'
  }>
}

export type MessageWithProduct = Message & { productName?: string | null }

export function getAdminProducts(params: { page?: number; pageSize?: number; search?: string } = {}) {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 20),
    ...(params.search ? { search: params.search } : {}),
  })
  return serverGet<PaginatedResponse<AdminProductListItem>>(`/api/products/admin?${qs}`)
}

export function getAdminProductById(id: number | string) {
  return serverGet<AdminProductDetail>(`/api/products/admin/${id}`)
}

export function getAdminCategories() {
  return serverGet<CategoryWithChildren[]>('/api/categories/admin')
}

export function getAdminCategoriesFlat() {
  return serverGet<Category[]>('/api/categories/admin/flat')
}

export function getDashboardStats() {
  return serverGet<DashboardStats>('/api/dashboard')
}

export function getMessages(params: { page?: number; pageSize?: number; status?: string } = {}) {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 20),
    ...(params.status ? { status: params.status } : {}),
  })
  return serverGet<PaginatedResponse<MessageWithProduct>>(`/api/messages?${qs}`)
}

export function getAdminOrders(params: { page?: number; pageSize?: number; status?: string } = {}) {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 20),
    ...(params.status ? { status: params.status } : {}),
  })
  return serverGet<PaginatedResponse<Order>>(`/api/orders/admin?${qs}`)
}

export function getAdminOrderById(id: number | string) {
  return serverGet<Order>(`/api/orders/admin/${id}`)
}
