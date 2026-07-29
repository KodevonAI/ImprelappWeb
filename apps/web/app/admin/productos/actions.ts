'use server'

import { revalidatePath } from 'next/cache'
import { serverPost, serverPut, serverDelete } from '@/lib/server-api'

export async function createProduct(formData: FormData): Promise<{ id: number }> {
  const data = {
    name: String(formData.get('name')),
    slug: String(formData.get('slug')),
    description: formData.get('description') ? String(formData.get('description')) : null,
    price: String(formData.get('price')),
    comparePrice: formData.get('comparePrice') ? String(formData.get('comparePrice')) : null,
    stock: Number(formData.get('stock') ?? 0),
    sku: formData.get('sku') ? String(formData.get('sku')) : null,
    categoryId: formData.get('categoryId') ? Number(formData.get('categoryId')) : null,
    featured: formData.get('featured') === 'true',
    active: formData.get('active') !== 'false',
  }

  const created = await serverPost<{ id: number }>('/api/products', data)

  const imageUrl = formData.get('imageUrl') as string
  if (imageUrl) {
    await serverPost(`/api/products/${created.id}/images`, { url: imageUrl })
  }

  revalidatePath('/admin/productos')
  return { id: created.id }
}

export async function updateProduct(id: number, formData: FormData): Promise<{ id: number }> {
  const data = {
    name: String(formData.get('name')),
    slug: String(formData.get('slug')),
    description: formData.get('description') ? String(formData.get('description')) : null,
    price: String(formData.get('price')),
    comparePrice: formData.get('comparePrice') ? String(formData.get('comparePrice')) : null,
    stock: Number(formData.get('stock') ?? 0),
    sku: formData.get('sku') ? String(formData.get('sku')) : null,
    categoryId: formData.get('categoryId') ? Number(formData.get('categoryId')) : null,
    featured: formData.get('featured') === 'true',
    active: formData.get('active') !== 'false',
  }

  await serverPut(`/api/products/${id}`, data)

  const imageUrl = formData.get('imageUrl') as string
  if (imageUrl) {
    await serverPost(`/api/products/${id}/images`, { url: imageUrl })
  }

  revalidatePath('/admin/productos')
  revalidatePath(`/admin/productos/${id}`)
  return { id }
}

export async function deleteProduct(id: number) {
  await serverDelete(`/api/products/${id}`)
  revalidatePath('/admin/productos')
}

export async function deleteProductImage(productId: number, imageId: number) {
  await serverDelete(`/api/products/${productId}/images/${imageId}`)
  revalidatePath(`/admin/productos/${productId}`)
}

interface BulkImportResult {
  created: number
  errors: Array<{ row: number; message: string }>
}

export async function bulkImportProducts(csv: string): Promise<BulkImportResult> {
  const result = await serverPost<BulkImportResult>('/api/products/bulk-import', { csv })
  revalidatePath('/admin/productos')
  return result
}
