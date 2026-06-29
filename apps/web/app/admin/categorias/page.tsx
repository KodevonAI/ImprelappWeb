import { AdminHeader } from '@/components/admin/header'
import { serverGet } from '@/lib/server-api'
import { CategoriesClient } from './categories-client'
import type { Category } from '@imprelapp/types'

export const metadata = { title: 'Categorías' }

type CategoryWithChildren = Category & { children?: CategoryWithChildren[] }

export default async function CategoriasPage() {
  let categories: CategoryWithChildren[] = []
  let flatCategories: Category[] = []

  try {
    ;[categories, flatCategories] = await Promise.all([
      serverGet<CategoryWithChildren[]>('/api/categories'),
      serverGet<Category[]>('/api/categories/flat'),
    ])
  } catch {}

  return (
    <>
      <AdminHeader title="Categorías" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <CategoriesClient categories={categories} flatCategories={flatCategories} />
        </div>
      </main>
    </>
  )
}
