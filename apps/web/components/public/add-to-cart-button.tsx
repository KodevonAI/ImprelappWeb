'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { Minus, Plus, ShoppingCart, Check } from 'lucide-react'

interface AddToCartButtonProps {
  productId: number
  name: string
  slug: string
  price: string
}

export function AddToCartButton({ productId, name, slug, price }: AddToCartButtonProps) {
  const router = useRouter()
  const { add } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    add({ productId, name, slug, price }, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border rounded-lg">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="p-2.5 hover:bg-muted transition-colors"
          aria-label="Disminuir cantidad"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="p-2.5 hover:bg-muted transition-colors"
          aria-label="Aumentar cantidad"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <Button size="lg" variant="outline" className="flex-1 justify-center" onClick={handleAdd}>
        {added ? (
          <>
            <Check className="size-5 mr-2" /> Agregado
          </>
        ) : (
          <>
            <ShoppingCart className="size-5 mr-2" /> Agregar al carrito
          </>
        )}
      </Button>
      {added && (
        <Button size="lg" variant="ghost" onClick={() => router.push('/carrito')}>
          Ver carrito
        </Button>
      )}
    </div>
  )
}
