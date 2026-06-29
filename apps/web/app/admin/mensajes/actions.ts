'use server'

import { revalidatePath } from 'next/cache'
import { serverPatch, serverDelete } from '@/lib/server-api'

export async function updateMessageStatus(id: number, status: 'new' | 'read' | 'replied') {
  await serverPatch(`/api/messages/${id}/status`, { status })
  revalidatePath('/admin/mensajes')
}

export async function deleteMessage(id: number) {
  await serverDelete(`/api/messages/${id}`)
  revalidatePath('/admin/mensajes')
}
