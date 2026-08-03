'use server'

import { revalidatePath } from 'next/cache'
import { serverPatch, serverPost, serverGet } from '@/lib/server-api'
import type { AdminProductListItem } from '@/lib/data/admin'
import type { OrderStatus, PaymentTerm, PaymentStatus, PaginatedResponse } from '@imprelapp/types'

export async function updateOrder(
  id: number,
  data: { status?: OrderStatus; paymentTerm?: PaymentTerm; paymentStatus?: PaymentStatus }
) {
  await serverPatch(`/api/orders/admin/${id}`, data)
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${id}`)
}

export async function searchProducts(query: string): Promise<AdminProductListItem[]> {
  if (!query.trim()) return []
  const qs = new URLSearchParams({ search: query, pageSize: '10' })
  const result = await serverGet<PaginatedResponse<AdminProductListItem>>(`/api/products/admin?${qs}`)
  return result.data.filter((p) => p.active)
}

interface CreateOrderInput {
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  notes?: string | null
  status?: OrderStatus
  paymentTerm?: PaymentTerm
  paymentStatus?: PaymentStatus
  items: Array<{ productId: number; quantity: number }>
}

export async function createOrder(data: CreateOrderInput): Promise<{ id: number }> {
  const created = await serverPost<{ id: number }>('/api/orders/admin', data)
  revalidatePath('/admin/pedidos')
  return created
}
