'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { formatCOP } from '@/lib/format'
import { Trash2, Search } from 'lucide-react'
import type { AdminProductListItem } from '@/lib/data/admin'
import type { OrderStatus, PaymentTerm, PaymentStatus } from '@imprelapp/types'

interface OrderLineItem {
  productId: number
  productName: string
  price: string
  stock: number
  quantity: number
}

const statusLabels: Record<OrderStatus, string> = {
  nuevo: 'Nuevo',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const paymentTermLabels: Record<PaymentTerm, string> = {
  contado: 'Contado',
  credito_30: 'Crédito 30 días',
  credito_60: 'Crédito 60 días',
  credito_90: 'Crédito 90 días',
}

interface OrderFormProps {
  searchProducts: (query: string) => Promise<AdminProductListItem[]>
  action: (data: {
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    notes?: string | null
    status?: OrderStatus
    paymentTerm?: PaymentTerm
    paymentStatus?: PaymentStatus
    items: Array<{ productId: number; quantity: number }>
  }) => Promise<{ id: number }>
}

export function OrderForm({ searchProducts, action }: OrderFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<OrderStatus>('confirmado')
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm | ''>('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pendiente')

  const [items, setItems] = useState<OrderLineItem[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdminProductListItem[]>([])
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(() => {
      searchProducts(query).then(setResults).catch(() => setResults([]))
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchProducts])

  function addProduct(product: AdminProductListItem) {
    if (items.some((i) => i.productId === product.id)) {
      toast.error('Ese producto ya está en el pedido')
      return
    }
    if (product.stock <= 0) {
      toast.error('Producto sin stock disponible')
      return
    }
    setItems((prev) => [...prev, { productId: product.id, productName: product.name, price: product.price, stock: product.stock, quantity: 1 }])
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  function updateQuantity(productId: number, quantity: number) {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(Math.max(1, quantity), i.stock) } : i))
    )
  }

  function removeItem(productId: number) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }

    startTransition(async () => {
      try {
        const { id } = await action({
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          notes: notes || null,
          status,
          paymentTerm: paymentTerm || undefined,
          paymentStatus,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        })
        toast.success('Pedido creado correctamente')
        router.push(`/admin/pedidos/${id}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al crear el pedido')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-semibold mb-3">Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Nombre *</Label>
            <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerPhone">Teléfono *</Label>
            <Input id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerAddress">Dirección *</Label>
            <Input id="customerAddress" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1.5 mt-4">
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Productos</h2>

        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 150)}
              placeholder="Buscar producto por nombre..."
              className="pl-9"
            />
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-lg max-h-64 overflow-y-auto">
              {results.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => addProduct(p)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/60 text-left"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                  </div>
                  <span className="text-muted-foreground">{formatCOP(p.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg border divide-y">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Sin productos agregados</p>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{formatCOP(item.price)} · Stock disponible: {item.stock}</p>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={item.stock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value) || 1)}
                  className="w-20"
                />
                <p className="text-sm font-medium w-28 text-right">{formatCOP((Number(item.price) * item.quantity).toFixed(2))}</p>
                <button type="button" onClick={() => removeItem(item.productId)}>
                  <Trash2 className="size-4 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="flex justify-between items-baseline pt-3 mt-3 border-t">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">{formatCOP(total.toFixed(2))}</span>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Estado del pedido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as OrderStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Plazo de pago</Label>
            <Select value={paymentTerm} onValueChange={(v) => setPaymentTerm((v as PaymentTerm) ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {Object.entries(paymentTermLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Estado de pago</Label>
            <Select value={paymentStatus} onValueChange={(v) => v && setPaymentStatus(v as PaymentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="pagado">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creando...' : 'Crear pedido'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
