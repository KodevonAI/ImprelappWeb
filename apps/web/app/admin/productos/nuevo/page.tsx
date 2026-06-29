import { AdminHeader } from '@/components/admin/header'
import { ProductForm } from '@/components/admin/product-form'
import { serverGet } from '@/lib/server-api'
import { createProduct } from '../actions'
import type { Category } from '@imprelapp/types'

export const metadata = { title: 'Nuevo producto' }

export default async function NuevoProductoPage() {
  let categories: Category[] = []
  try {
    categories = await serverGet<Category[]>('/api/categories/flat')
  } catch {}

  return (
    <>
      <AdminHeader title="Nuevo producto" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto rounded-xl border bg-card p-6">
          <ProductForm categories={categories} action={createProduct} />
        </div>
      </main>
    </>
  )
}
