'use server'

import { revalidatePath } from 'next/cache'
import { serverPost, serverPut, serverDelete } from '@/lib/server-api'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const API_URL = process.env.API_URL ?? 'http://localhost:3001'

async function getToken() {
  const store = await cookies()
  return store.get('admin_token')?.value
}

export async function createProduct(formData: FormData) {
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

  // Upload images if provided
  const images = formData.getAll('images') as File[]
  const imageUrl = formData.get('imageUrl') as string

  if (imageUrl) {
    await serverPost(`/api/products/${created.id}/images`, { url: imageUrl })
  }

  for (const file of images) {
    if (file.size === 0) continue
    const fd = new FormData()
    fd.append('image', file)
    const token = await getToken()
    await fetch(`${API_URL}/api/products/${created.id}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
  }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

export async function updateProduct(id: number, formData: FormData) {
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

  // Upload new images
  const images = formData.getAll('images') as File[]
  const imageUrl = formData.get('imageUrl') as string

  if (imageUrl) {
    await serverPost(`/api/products/${id}/images`, { url: imageUrl })
  }

  for (const file of images) {
    if (file.size === 0) continue
    const fd = new FormData()
    fd.append('image', file)
    const token = await getToken()
    await fetch(`${API_URL}/api/products/${id}/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
  }

  revalidatePath('/admin/productos')
  revalidatePath(`/admin/productos/${id}`)
  redirect('/admin/productos')
}

export async function deleteProduct(id: number) {
  await serverDelete(`/api/products/${id}`)
  revalidatePath('/admin/productos')
}

export async function deleteProductImage(productId: number, imageId: number) {
  await serverDelete(`/api/products/${productId}/images/${imageId}`)
  revalidatePath(`/admin/productos/${productId}`)
}
