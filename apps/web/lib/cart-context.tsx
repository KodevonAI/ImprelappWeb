'use client'

import { createContext, useContext, useSyncExternalStore } from 'react'

export interface CartItem {
  productId: number
  name: string
  slug: string
  price: string
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQty: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  clear: () => void
  total: number
  count: number
}

const STORAGE_KEY = 'imprelapp_cart'

let cache: CartItem[] = []
let cacheRaw: string | null = null
const listeners = new Set<() => void>()

function readFromStorage(): CartItem[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === cacheRaw) return cache
  cacheRaw = raw
  try {
    cache = raw ? JSON.parse(raw) : []
  } catch {
    cache = []
  }
  return cache
}

function writeToStorage(items: CartItem[]) {
  cache = items
  cacheRaw = JSON.stringify(items)
  localStorage.setItem(STORAGE_KEY, cacheRaw)
  listeners.forEach((l) => l())
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getServerSnapshot(): CartItem[] {
  return []
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readFromStorage, getServerSnapshot)

  function add(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const current = readFromStorage()
    const existing = current.find((i) => i.productId === item.productId)
    const next = existing
      ? current.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { ...item, quantity }]
    writeToStorage(next)
  }

  function updateQty(productId: number, quantity: number) {
    if (quantity < 1) return
    writeToStorage(readFromStorage().map((i) => (i.productId === productId ? { ...i, quantity } : i)))
  }

  function remove(productId: number) {
    writeToStorage(readFromStorage().filter((i) => i.productId !== productId))
  }

  function clear() {
    writeToStorage([])
  }

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
