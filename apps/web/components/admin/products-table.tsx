'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { formatCOP } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import type { AdminProductListItem } from '@/lib/data/admin'

interface ProductsTableProps {
  products: AdminProductListItem[]
  deleteProduct: (id: number) => Promise<void>
  bulkDeleteProducts: (ids: number[]) => Promise<void>
  emptyMessage?: string
}

export function ProductsTable({ products, deleteProduct, bulkDeleteProducts, emptyMessage = 'No hay productos aún' }: ProductsTableProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<number[]>([])
  const [isPending, startTransition] = useTransition()

  const allSelected = products.length > 0 && selected.length === products.length
  const someSelected = selected.length > 0 && !allSelected

  function toggleAll() {
    setSelected(allSelected ? [] : products.map((p) => p.id))
  }

  function toggleOne(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  function handleBulkDelete() {
    startTransition(async () => {
      try {
        await bulkDeleteProducts(selected)
        toast.success(`${selected.length} producto(s) eliminado(s)`)
        setSelected([])
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al eliminar')
      }
    })
  }

  return (
    <>
      {selected.length > 0 && (
        <div className="px-4 py-2.5 border-b bg-muted/40 flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{selected.length} seleccionado(s)</span>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={isPending}>
            <Trash2 className="size-4 mr-1" /> {isPending ? 'Eliminando...' : 'Eliminar seleccionados'}
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={() => toggleOne(p.id)}
                    aria-label={`Seleccionar ${p.name}`}
                  />
                </TableCell>
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
                    <DeleteDialog label={p.name} onConfirm={() => deleteProduct(p.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  )
}
