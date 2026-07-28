'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { Search, Menu, X, Phone, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? '573000000000'

interface NavbarProps {
  categoryLinks?: Array<{ name: string; slug: string }>
}

export function Navbar({ categoryLinks = [] }: NavbarProps) {
  const router = useRouter()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/productos?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 flex items-center justify-end gap-4">
        <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-1 hover:opacity-80">
          <Phone className="size-3" /> Llámanos
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
        >
          WhatsApp
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo-full.png" alt="Imprelapp" width={535} height={306} className="h-12 w-auto" priority />
        </Link>

        {/* Search */}
        <div className="flex-1 flex justify-center">
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar taladros, martillos, repuestos..."
                className="w-full h-10 pl-9 pr-4 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background"
              />
            </div>
          </form>
        </div>

        {/* Cart */}
        <Link
          href="/carrito"
          className="relative p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
          aria-label="Carrito"
        >
          <ShoppingCart className="size-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
              {count}
            </span>
          )}
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className={cn(
        'border-t bg-white sm:block',
        menuOpen ? 'block' : 'hidden sm:block'
      )}>
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-0 sm:overflow-x-auto">
            <li>
              <Link
                href="/productos"
                className="block px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-muted/50 transition-colors whitespace-nowrap"
                onClick={() => setMenuOpen(false)}
              >
                Todos los productos
              </Link>
            </li>
            {categoryLinks.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/categorias/${cat.slug}`}
                  className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="sm:ml-auto">
              <Link
                href="/contacto"
                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors whitespace-nowrap"
                onClick={() => setMenuOpen(false)}
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  )
}
