'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LayoutGrid, MessageCircle, Search, ShoppingCart, Truck, UserCog, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'
import { CategoryIcon } from '@/lib/category-ui'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? '573207360233'

interface NavbarProps {
  categoryLinks?: Array<{ name: string; slug: string }>
}

export function Navbar({ categoryLinks = [] }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { count } = useCart()
  // The menu remembers the path it was opened on, so navigating closes it.
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const menuOpen = openedAt === pathname
  const setMenuOpen = (open: boolean) => setOpenedAt(open ? pathname : null)
  const [search, setSearch] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the categories menu on outside click and Escape.
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenedAt(null)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenedAt(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    if (q) {
      router.push(`/productos?search=${encodeURIComponent(q)}`)
      setSearch('')
    }
  }

  const searchForm = (
    <form onSubmit={handleSearch} role="search" className="w-full">
      <div className="relative">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="¿Qué estás buscando? Rodamientos, correas, llaves…"
          aria-label="Buscar productos"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-4 pr-12 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label="Buscar"
        >
          <Search className="size-4" />
        </button>
      </div>
    </form>
  )

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Utility bar */}
      <div className="bg-slate-900 text-[12px] text-slate-200">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4">
          <p className="flex items-center gap-1.5 truncate">
            <Truck className="size-3.5 shrink-0" /> Envíos a toda Colombia
          </p>
          <nav aria-label="Enlaces de servicio" className="flex items-center divide-x divide-slate-700">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 hover:text-white"
            >
              Ventas WhatsApp
            </a>
            <Link href="/contacto" className="hidden px-3 hover:text-white sm:inline">
              Contacto
            </Link>
            <Link href="/admin/login" rel="nofollow" className="flex items-center gap-1 pl-3 hover:text-white">
              <UserCog className="size-3" /> Admin
            </Link>
          </nav>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-5">
          <Link href="/" className="shrink-0" aria-label="Imprelapp - inicio">
            <Image src="/logo-full.png" alt="Imprelapp" width={535} height={306} className="h-11 w-auto md:h-12" priority />
          </Link>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="categories-menu"
              className={cn(
                'flex h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors',
                menuOpen ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-300 hover:border-primary hover:text-primary'
              )}
            >
              {menuOpen ? <X className="size-4" /> : <LayoutGrid className="size-4" />}
              <span className="hidden sm:inline">Categorías</span>
              <ChevronDown className={cn('hidden size-4 transition-transform sm:block', menuOpen && 'rotate-180')} />
            </button>

            {menuOpen && (
              <div
                id="categories-menu"
                className="absolute left-0 top-full z-50 mt-2 w-[min(92vw,640px)] rounded-xl border bg-white p-3 shadow-2xl"
              >
                <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {categoryLinks.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/categorias/${cat.slug}`}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-primary/5 hover:text-primary"
                        >
                          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CategoryIcon slug={cat.slug} className="size-4.5" />
                          </span>
                          {cat.name}
                        </Link>
                      </li>
                  ))}
                </ul>
                <Link
                  href="/productos"
                  className="mt-2 block rounded-lg bg-muted px-3 py-2.5 text-center text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Ver todo el catálogo →
                </Link>
              </div>
            )}
          </div>

          <div className="hidden flex-1 md:block">{searchForm}</div>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted lg:flex"
            >
              <MessageCircle className="size-5 text-green-600" />
              <span className="leading-tight">
                <span className="block text-[11px] text-muted-foreground">Asesoría</span>
                <span className="font-semibold">WhatsApp</span>
              </span>
            </a>
            <Link
              href="/carrito"
              className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              aria-label={`Carrito${count ? `, ${count} productos` : ''}`}
            >
              <ShoppingCart className="size-6" />
              {count > 0 && (
                <span className="absolute left-7 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
              <span className="hidden font-semibold lg:inline">Carrito</span>
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">{searchForm}</div>
      </div>

      {/* Quick category links */}
      <nav aria-label="Categorías principales" className="hidden border-b bg-white md:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
          {categoryLinks.slice(0, 7).map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/categorias/${cat.slug}`}
                className={cn(
                  'block whitespace-nowrap border-b-2 px-3 py-2 text-[13px] transition-colors',
                  pathname === `/categorias/${cat.slug}`
                    ? 'border-primary font-semibold text-primary'
                    : 'border-transparent text-slate-600 hover:text-primary'
                )}
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link href="/marcas" className="block whitespace-nowrap px-3 py-2 text-[13px] text-slate-600 hover:text-primary">
              Marcas
            </Link>
          </li>
          <li>
            <Link href="/productos" className="block whitespace-nowrap px-3 py-2 text-[13px] font-semibold text-primary">
              Todo el catálogo
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
