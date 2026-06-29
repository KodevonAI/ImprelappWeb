'use server'

import { revalidatePath } from 'next/cache'
import { serverPost, serverPut, serverDelete } from '@/lib/server-api'

export async function createCategory(formData: FormData) {
  const data = {
    name: String(formData.get('name')),
    slug: String(formData.get('slug')),
    description: formData.get('description') ? String(formData.get('description')) : null,
    parentId: formData.get('parentId') ? Number(formData.get('parentId')) : null,
    order: Number(formData.get('order') ?? 0),
    active: formData.get('active') !== 'false',
  }
  await serverPost('/api/categories', data)
  revalidatePath('/admin/categorias')
}

export async function updateCategory(id: number, formData: FormData) {
  const data = {
    name: String(formData.get('name')),
    slug: String(formData.get('slug')),
    description: formData.get('description') ? String(formData.get('description')) : null,
    parentId: formData.get('parentId') ? Number(formData.get('parentId')) : null,
    order: Number(formData.get('order') ?? 0),
    active: formData.get('active') !== 'false',
  }
  await serverPut(`/api/categories/${id}`, data)
  revalidatePath('/admin/categorias')
}

export async function deleteCategory(id: number) {
  await serverDelete(`/api/categories/${id}`)
  revalidatePath('/admin/categorias')
}
