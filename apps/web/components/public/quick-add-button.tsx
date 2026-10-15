'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { cn } from '@/lib/utils'

interface QuickAddButtonProps {
  productId: number
  name: string
  slug: string
  price: string
  className?: string
}

export function QuickAddButton({ productId, name, slug, price, className }: QuickAddButtonProps) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        add({ productId, name, slug, price }, 1)
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
      }}
      className={cn(
        'inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors',
        added
          ? 'border-green-600 bg-green-600 text-white'
          : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground',
        className
      )}
      aria-live="polite"
    >
      {added ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      {added ? 'Agregado' : 'Agregar'}
    </button>
  )
}
