import Link from 'next/link'
import { AdminHeader } from '@/components/admin/header'
import { getAdminProducts, type AdminProductListItem } from '@/lib/data/admin'
import { Button, buttonVariants } from '@/components/ui/button'
import { ProductsTable } from '@/components/admin/products-table'
import { BulkImportDialog } from '@/components/admin/bulk-import-dialog'
import { deleteProduct, bulkDeleteProducts, bulkImportProducts } from './actions'
import { cn } from '@/lib/utils'
import { Plus, Download } from 'lucide-react'
import type { PaginatedResponse } from '@imprelapp/types'

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page = '1', search = '' } = await searchParams

  let result: PaginatedResponse<AdminProductListItem> | null = null
  try {
    result = await getAdminProducts({ page: Number(page), pageSize: 20, search: search || undefined })
  } catch {}

  return (
    <>
      <AdminHeader
        title="Productos"
        action={
          <div className="flex items-center gap-2">
            <a href="/api/admin/products/template" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              <Download className="size-4 mr-1" /> Descargar template
            </a>
            <BulkImportDialog action={bulkImportProducts} />
            <Link href="/admin/productos/nuevo" className={cn(buttonVariants({ size: 'sm' }))}>
              <Plus className="size-4 mr-1" /> Nuevo
            </Link>
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between gap-3">
            <form className="flex gap-2">
              <input
                name="search"
                defaultValue={search}
                placeholder="Buscar producto..."
                className="h-8 px-3 rounded-lg border text-sm bg-background w-64 focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="sm" variant="outline">Buscar</Button>
            </form>
            {result && (
              <span className="text-sm text-muted-foreground">{result.total} productos</span>
            )}
          </div>

          <ProductsTable
            products={result?.data ?? []}
            deleteProduct={deleteProduct}
            bulkDeleteProducts={bulkDeleteProducts}
            emptyMessage={search ? 'Sin resultados para esa búsqueda' : 'No hay productos aún'}
          />

          {result && result.totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Página {result.page} de {result.totalPages}</p>
              <div className="flex gap-2">
                {result.page > 1 && (
                  <Link
                    href={`?page=${result.page - 1}${search ? `&search=${search}` : ''}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Anterior
                  </Link>
                )}
                {result.page < result.totalPages && (
                  <Link
                    href={`?page=${result.page + 1}${search ? `&search=${search}` : ''}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
