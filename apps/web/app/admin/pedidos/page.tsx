import Link from 'next/link'
import { AdminHeader } from '@/components/admin/header'
import { getAdminOrders } from '@/lib/data/admin'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCOP } from '@/lib/format'
import { formatDistanceToNow } from '@/lib/format'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Order, OrderStatus, PaymentStatus, PaginatedResponse } from '@imprelapp/types'

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  nuevo: { label: 'Nuevo', variant: 'default' },
  confirmado: { label: 'Confirmado', variant: 'secondary' },
  enviado: { label: 'Enviado', variant: 'outline' },
  entregado: { label: 'Entregado', variant: 'outline' },
  cancelado: { label: 'Cancelado', variant: 'destructive' },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  pagado: { label: 'Pagado', variant: 'default' },
  vencido: { label: 'Vencido', variant: 'destructive' },
}

const filterOptions: Array<{ value: OrderStatus | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'nuevo', label: 'Nuevos' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'entregado', label: 'Entregados' },
  { value: 'cancelado', label: 'Cancelados' },
]

export const metadata = { title: 'Pedidos' }

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const { page = '1', status = '' } = await searchParams

  let result: PaginatedResponse<Order> | null = null
  try {
    result = await getAdminOrders({ page: Number(page), pageSize: 20, status: status || undefined })
  } catch {}

  return (
    <>
      <AdminHeader
        title="Pedidos"
        action={
          <Link href="/admin/pedidos/nuevo" className={cn(buttonVariants({ size: 'sm' }))}>
            <Plus className="size-4 mr-1" /> Nuevo pedido
          </Link>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b flex gap-2">
            {filterOptions.map(({ value, label }) => (
              <Link
                key={value}
                href={`/admin/pedidos${value ? `?status=${value}` : ''}`}
                className={cn(buttonVariants({ variant: status === value ? 'default' : 'ghost', size: 'sm' }))}
              >
                {label}
              </Link>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!result?.data.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    Sin pedidos
                  </TableCell>
                </TableRow>
              ) : (
                result.data.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/admin/pedidos/${order.id}`} className="block">
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{formatCOP(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[order.status].variant}>{statusConfig[order.status].label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatusConfig[order.paymentStatus].variant}>
                        {paymentStatusConfig[order.paymentStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.dueDate ? new Date(order.dueDate).toLocaleDateString('es-CO') : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(order.createdAt)}
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
                    href={`?page=${result.page - 1}${status ? `&status=${status}` : ''}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Anterior
                  </Link>
                )}
                {result.page < result.totalPages && (
                  <Link
                    href={`?page=${result.page + 1}${status ? `&status=${status}` : ''}`}
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
