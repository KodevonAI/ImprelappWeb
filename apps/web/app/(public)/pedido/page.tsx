'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatCOP } from '@/lib/format'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CheckCircle, ShoppingCart } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function PedidoPage() {
  const { items, total, clear } = useCart()
  const [isPending, startTransition] = useTransition()
  const [orderId, setOrderId] = useState<number | null>(null)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      customerName: fd.get('customerName'),
      customerEmail: fd.get('customerEmail'),
      customerPhone: fd.get('customerPhone'),
      customerAddress: fd.get('customerAddress'),
      notes: fd.get('notes') || null,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    }

    startTransition(async () => {
      setError('')
      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error al enviar el pedido')
        setOrderId(data.id)
        clear()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al enviar el pedido')
      }
    })
  }

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CheckCircle className="size-14 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">¡Pedido #{orderId} recibido!</h1>
        <p className="text-muted-foreground mb-6">Te contactaremos pronto para confirmar los detalles.</p>
        <Link href="/productos" className={cn(buttonVariants())}>Seguir comprando</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="size-12 mx-auto mb-4 text-muted-foreground/20" />
        <h1 className="text-xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">Agrega productos antes de hacer un pedido.</p>
        <Link href="/productos" className={cn(buttonVariants())}>Ver catálogo</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Confirmar pedido</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Nombre *</Label>
            <Input id="customerName" name="customerName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerEmail">Correo *</Label>
            <Input id="customerEmail" name="customerEmail" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerPhone">Teléfono *</Label>
            <Input id="customerPhone" name="customerPhone" type="tel" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerAddress">Dirección de entrega *</Label>
            <Input id="customerAddress" name="customerAddress" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Instrucciones de entrega, horarios, etc." />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Confirmar pedido'}
          </Button>
        </form>

        <div className="rounded-xl border bg-card p-5 h-fit">
          <h2 className="font-semibold mb-4">Resumen</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm gap-3">
                <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                <span className="font-medium shrink-0">{formatCOP(Number(item.price) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-baseline">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">{formatCOP(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
