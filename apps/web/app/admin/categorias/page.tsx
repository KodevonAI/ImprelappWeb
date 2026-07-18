import { AdminHeader } from '@/components/admin/header'
import { getAdminCategories, getAdminCategoriesFlat, type CategoryWithChildren } from '@/lib/data/admin'
import { CategoriesClient } from './categories-client'
import type { Category } from '@imprelapp/types'

export const metadata = { title: 'Categorías' }

export default async function CategoriasPage() {
  let categories: CategoryWithChildren[] = []
  let flatCategories: Category[] = []

  try {
    ;[categories, flatCategories] = await Promise.all([
      getAdminCategories(),
      getAdminCategoriesFlat(),
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
