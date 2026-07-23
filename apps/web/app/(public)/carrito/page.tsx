'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatCOP } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'

export default function CarritoPage() {
  const { items, updateQty, remove, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="size-12 mx-auto mb-4 text-muted-foreground/20" />
        <h1 className="text-xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-6">Explora el catálogo y agrega productos.</p>
        <Link href="/productos" className={cn(buttonVariants())}>Ver catálogo</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tu carrito</h1>

      <div className="rounded-xl border bg-card divide-y">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <Link href={`/productos/${item.slug}`} className="font-medium text-sm hover:text-primary transition-colors">
                {item.name}
              </Link>
              <p className="text-sm text-muted-foreground mt-0.5">{formatCOP(item.price)} c/u</p>
            </div>

            <div className="flex items-center border rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.quantity - 1)}
                className="p-2 hover:bg-muted transition-colors"
                aria-label="Disminuir cantidad"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQty(item.productId, item.quantity + 1)}
                className="p-2 hover:bg-muted transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <p className="w-28 text-right font-semibold text-sm shrink-0">
              {formatCOP(Number(item.price) * item.quantity)}
            </p>

            <button
              type="button"
              onClick={() => remove(item.productId)}
              className="p-2 rounded-lg text-destructive hover:bg-muted transition-colors shrink-0"
              aria-label="Quitar"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-primary">{formatCOP(total)}</p>
        </div>
        <Link href="/pedido" className={cn(buttonVariants({ size: 'lg' }))}>
          Continuar al pedido
        </Link>
      </div>
    </div>
  )
}
