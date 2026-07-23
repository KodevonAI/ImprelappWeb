import { notFound } from 'next/navigation'
import { AdminHeader } from '@/components/admin/header'
import { getAdminOrderById } from '@/lib/data/admin'
import { OrderManage } from './order-manage'
import { formatCOP } from '@/lib/format'
import { Mail, Phone, MapPin } from 'lucide-react'

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await getAdminOrderById(id).catch(() => null)
  if (!order) notFound()

  return (
    <>
      <AdminHeader title={`Pedido #${order.id}`} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3">Cliente</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5" /> {order.customerEmail}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5" /> {order.customerPhone}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5" /> {order.customerAddress}
              </p>
              {order.notes && (
                <p className="pt-2 border-t text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-3">Productos</h2>
            <div className="divide-y">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.productSku && <p className="text-xs text-muted-foreground">Ref: {item.productSku}</p>}
                  </div>
                  <p className="text-muted-foreground">{item.quantity} × {formatCOP(item.unitPrice)}</p>
                  <p className="font-medium">{formatCOP(item.subtotal)}</p>
                </div>
              ))}
            </div>
            <div className="pt-3 mt-3 border-t flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">{formatCOP(order.total)}</span>
            </div>
          </div>

          <OrderManage order={order} />
        </div>
      </main>
    </>
  )
}
