import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { ProductForm } from '@/components/admin/product-form'
import { getAdminProductById, getAdminCategoriesFlat, type AdminProductDetail } from '@/lib/data/admin'
import { updateProduct } from '../actions'
import type { Category } from '@imprelapp/types'

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let product: AdminProductDetail | null = null
  let categories: Category[] = []

  try {
    ;[product, categories] = await Promise.all([
      getAdminProductById(id),
      getAdminCategoriesFlat(),
    ])
  } catch {
    notFound()
  }

  if (!product) notFound()

  const action = updateProduct.bind(null, product.id)

  return (
    <>
      <AdminHeader title={`Editar: ${product.name}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto rounded-xl border bg-card p-6">
          <ProductForm product={product} categories={categories} action={action} />
        </div>
      </main>
    </>
  )
}
