import Link from 'next/link'
import { AdminHeader } from '@/components/admin/header'
import { getAdminProducts, type AdminProductListItem } from '@/lib/data/admin'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { BulkImportDialog } from '@/components/admin/bulk-import-dialog'
import { deleteProduct, bulkImportProducts } from './actions'
import { formatCOP } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Download } from 'lucide-react'
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {!result?.data.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    {search ? 'Sin resultados para esa búsqueda' : 'No hay productos aún'}
                  </TableCell>
                </TableRow>
              ) : (
                result.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.featured && <span className="text-xs text-amber-600">★ Destacado</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.categoryName ?? '—'}</TableCell>
                    <TableCell className="text-sm">{formatCOP(p.price)}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock <= 5 ? 'destructive' : 'secondary'}>{p.stock}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.active ? 'default' : 'outline'}>{p.active ? 'Activo' : 'Inactivo'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/productos/${p.id}`}
                          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <DeleteDialog
                          label={p.name}
                          onConfirm={async () => {
                            'use server'
                            await deleteProduct(p.id)
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

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
