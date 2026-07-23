'use server'

import { revalidatePath } from 'next/cache'
import { serverPatch } from '@/lib/server-api'
import type { OrderStatus, PaymentTerm, PaymentStatus } from '@imprelapp/types'

export async function updateOrder(
  id: number,
  data: { status?: OrderStatus; paymentTerm?: PaymentTerm; paymentStatus?: PaymentStatus }
) {
  await serverPatch(`/api/orders/admin/${id}`, data)
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${id}`)
}
