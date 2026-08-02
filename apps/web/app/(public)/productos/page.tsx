import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts, getCategoriesFlat } from '@/lib/data/public'
import { formatCOP } from '@/lib/format'
import { Package } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const metadata: Metadata = {
  title: 'Catálogo de Productos',
  description: 'Explora nuestro catálogo de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad, rodillos, repuestos automotrices, equipo de carga y ferretería en general. Precios en COP, envíos a toda Colombia.',
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string; page?: string }>
}) {
  const { search = '', categoryId = '', page = '1' } = await searchParams

  const [result, categories] = await Promise.all([
    getProducts({
      search: search || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      page: Number(page),
      pageSize: 24,
    }),
    getCategoriesFlat(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full sm:w-56 shrink-0">
          <div className="rounded-xl border bg-card p-4">
            <p className="font-semibold text-sm mb-3">Categorías</p>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/productos"
                  className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${!categoryId ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                >
                  Todos
                </Link>
              </li>
              {categories.filter((c) => !c.parentId).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/productos?categoryId=${cat.id}${search ? `&search=${search}` : ''}`}
                    className={`block px-2 py-1.5 rounded-lg text-sm transition-colors ${categoryId === String(cat.id) ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 gap-3">
            <form className="flex-1 max-w-sm">
              <input
                name="search"
                defaultValue={search}
                placeholder="Buscar producto..."
                className="w-full h-9 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </form>
            {result && <p className="text-sm text-muted-foreground shrink-0">{result.total} productos</p>}
          </div>

          {!result?.data.length ? (
            <div className="py-20 text-center text-muted-foreground">
              <Package className="size-12 mx-auto mb-3 opacity-20" />
              <p>No hay productos{search ? ` para "${search}"` : ''}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {result.data.map((p) => (
                <Link
                  key={p.id}
                  href={`/productos/${p.slug}`}
                  className="rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {p.image ? (
                      <Image
                        src={p.image.startsWith('/') ? `${API_URL}${p.image}` : p.image}
                        alt={p.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="size-10 text-muted-foreground/20" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">{p.categoryName ?? ''}</p>
                    <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-primary font-bold text-sm">{formatCOP(p.price)}</span>
                      {p.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">{formatCOP(p.comparePrice)}</span>
                      )}
                    </div>
                    {!p.inStock && <p className="text-xs text-destructive mt-1">Sin stock</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {result && result.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {result.page > 1 && (
                <Link href={`?page=${result.page - 1}${search ? `&search=${search}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}`}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors">Anterior</Link>
              )}
              <span className="px-4 py-2 text-sm text-muted-foreground">
                {result.page} / {result.totalPages}
              </span>
              {result.page < result.totalPages && (
                <Link href={`?page=${result.page + 1}${search ? `&search=${search}` : ''}${categoryId ? `&categoryId=${categoryId}` : ''}`}
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors">Siguiente</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
