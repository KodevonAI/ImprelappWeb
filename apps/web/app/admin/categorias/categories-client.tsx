'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoryForm } from '@/components/admin/category-form'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { createCategory, updateCategory, deleteCategory } from './actions'
import { Plus, Pencil, ChevronRight } from 'lucide-react'
import type { Category } from '@imprelapp/types'

type CategoryWithChildren = Category & { children?: CategoryWithChildren[] }

interface CategoriesClientProps {
  categories: CategoryWithChildren[]
  flatCategories: Category[]
}

function CategoryRow({
  cat,
  depth,
  flatCategories,
}: {
  cat: CategoryWithChildren
  depth: number
  flatCategories: Category[]
}) {
  const [editOpen, setEditOpen] = useState(false)

  const updateAction = updateCategory.bind(null, cat.id)

  return (
    <>
      <div
        className="flex items-center justify-between py-2.5 px-4 hover:bg-muted/40 rounded-lg group"
        style={{ paddingLeft: `${16 + depth * 24}px` }}
      >
        <div className="flex items-center gap-2">
          {depth > 0 && <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />}
          <span className="text-sm font-medium">{cat.name}</span>
          <span className="text-xs text-muted-foreground">/{cat.slug}</span>
          {!cat.active && <Badge variant="outline" className="text-xs">Inactiva</Badge>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
          </Button>
          <DeleteDialog label={cat.name} onConfirm={async () => deleteCategory(cat.id)} />
        </div>
      </div>

      {cat.children?.map((child) => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} flatCategories={flatCategories} />
      ))}

      <CategoryForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        category={cat}
        categories={flatCategories}
        action={updateAction}
      />
    </>
  )
}

export function CategoriesClient({ categories, flatCategories }: CategoriesClientProps) {
  const [createOpen, setCreateOpen] = useState(false)


  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-1" /> Nueva categoría
        </Button>
      </div>

      <div className="rounded-xl border bg-card divide-y">
        {categories.length === 0 ? (
          <p className="px-4 py-12 text-sm text-muted-foreground text-center">No hay categorías aún</p>
        ) : (
          <div className="p-2">
            {categories.map((cat) => (
              <CategoryRow key={cat.id} cat={cat} depth={0} flatCategories={flatCategories} />
            ))}
          </div>
        )}
      </div>

      <CategoryForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={flatCategories}
        action={createCategory}
      />
    </div>
  )
}
