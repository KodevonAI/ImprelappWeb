import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PublicLayout } from '@/components/public/public-layout'
import { publicGet } from '@/lib/public-api'
import { formatCOP } from '@/lib/format'
import { Package } from 'lucide-react'
import type { Category, PaginatedResponse } from '@imprelapp/types'

interface ProductRow {
  id: number; name: string; slug: string; price: string
  comparePrice: string | null; stock: number
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const flat = await publicGet<Category[]>('/api/categories/flat')
    const cat = flat.find((c) => c.slug === slug)
    if (!cat) return { title: 'Categoría' }
    return {
      title: cat.name,
      description: cat.description ?? `Productos de ${cat.name} en Imprelapp`,
    }
  } catch {
    return { title: 'Categoría' }
  }
}

export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page = '1' } = await searchParams

  let category: Category | null = null
  let result: PaginatedResponse<ProductRow> | null = null

  try {
    const flat = await publicGet<Category[]>('/api/categories/flat')
    category = flat.find((c) => c.slug === slug) ?? null
    if (!category) notFound()
    result = await publicGet<PaginatedResponse<ProductRow>>(
      `/api/products?categoryId=${category.id}&page=${page}&pageSize=24`
    )
  } catch {
    notFound()
  }

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground mb-2">
            <Link href="/" className="hover:text-foreground">Inicio</Link>
            {' / '}
            <Link href="/productos" className="hover:text-foreground">Productos</Link>
            {' / '}
            <span className="text-foreground">{category!.name}</span>
          </nav>
          <h1 className="text-2xl font-bold">{category!.name}</h1>
          {result && <p className="text-sm text-muted-foreground mt-1">{result.total} productos</p>}
        </div>

        {!result?.data.length ? (
          <div className="py-20 text-center text-muted-foreground">
            <Package className="size-12 mx-auto mb-3 opacity-20" />
            <p>Sin productos en esta categoría aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.data.map((p) => (
              <Link
                key={p.id}
                href={`/productos/${p.slug}`}
                className="rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Package className="size-10 text-muted-foreground/20" />
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-primary font-bold text-sm">{formatCOP(p.price)}</span>
                    {p.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">{formatCOP(p.comparePrice)}</span>
                    )}
                  </div>
                  {p.stock === 0 && <p className="text-xs text-destructive mt-1">Sin stock</p>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {result && result.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {result.page > 1 && (
              <Link href={`?page=${result.page - 1}`} className="px-4 py-2 rounded-lg border text-sm hover:bg-muted">Anterior</Link>
            )}
            <span className="px-4 py-2 text-sm text-muted-foreground">{result.page} / {result.totalPages}</span>
            {result.page < result.totalPages && (
              <Link href={`?page=${result.page + 1}`} className="px-4 py-2 rounded-lg border text-sm hover:bg-muted">Siguiente</Link>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
