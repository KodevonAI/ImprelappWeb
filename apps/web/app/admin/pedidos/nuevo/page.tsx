import { AdminHeader } from '@/components/admin/header'
import { OrderForm } from '@/components/admin/order-form'
import { createOrder, searchProducts } from '../actions'

export const metadata = { title: 'Nuevo pedido' }

export default function NuevoPedidoPage() {
  return (
    <>
      <AdminHeader title="Nuevo pedido" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto rounded-xl border bg-card p-6">
          <OrderForm searchProducts={searchProducts} action={createOrder} />
        </div>
      </main>
    </>
  )
}
