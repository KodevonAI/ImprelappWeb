import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCategoriesFlat, getCategoryBySlug, getProducts } from '@/lib/data/public'
import { formatCOP } from '@/lib/format'
import { Package } from 'lucide-react'
import { JsonLd, SITE_URL, breadcrumbJsonLd, imageUrl, pageMetadata, truncate } from '@/lib/seo'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

function categoryPath(slug: string, page: number) {
  return page > 1 ? `/categorias/${slug}?page=${page}` : `/categorias/${slug}`
}

function cleanDescription(description: string | null) {
  return description?.trim().replace(/\.+$/, '') ?? ''
}

function categoryDescription(name: string, description: string | null, total: number) {
  if (cleanDescription(description)) return truncate(`${cleanDescription(description)}. Precios en COP y envío a toda Colombia.`)
  const count = total > 0 ? `${total} referencias de ` : ''
  return truncate(`Compra ${count}${name.toLowerCase()} en Imprelapp. Precios en COP, envío a toda Colombia y asesoría técnica por WhatsApp.`)
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const cat = await getCategoryBySlug(slug)
  if (!cat) return { title: 'Categoría no encontrada', robots: { index: false } }
  const result = await getProducts({ categoryId: cat.id, page, pageSize: 24 })
  return pageMetadata({
    title: `${cat.name}${page > 1 ? ` (página ${page})` : ''} | Compra en línea en Colombia`,
    description: categoryDescription(cat.name, cat.description, result.total),
    path: categoryPath(cat.slug, page),
    images: cat.image ? [{ url: imageUrl(cat.image), alt: cat.name }] : undefined,
  })
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { slug } = await params
  const page = Math.max(1, Number((await searchParams).page) || 1)

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [result, flat] = await Promise.all([
    getProducts({ categoryId: category.id, page, pageSize: 24 }),
    getCategoriesFlat(),
  ])
  const parent = category.parentId ? flat.find((c) => c.id === category.parentId) : null
  const subcategories = flat.filter((c) => c.parentId === category.id)

  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    ...(parent ? [{ name: parent.name, path: `/categorias/${parent.slug}` }] : []),
    { name: category.name, path: `/categorias/${category.slug}` },
  ]
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    url: `${SITE_URL}${categoryPath(category.slug, page)}`,
    description: categoryDescription(category.name, category.description, result.total),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: result.total,
      itemListElement: result.data.map((p, i) => ({
        '@type': 'ListItem',
        position: (page - 1) * 24 + i + 1,
        url: `${SITE_URL}/productos/${p.slug}`,
        name: p.name.trim(),
      })),
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <JsonLd data={[collectionJsonLd, breadcrumbJsonLd(crumbs)]} />
      <div className="mb-6">
        <nav aria-label="Migas de pan" className="text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">Inicio</Link>
          {' / '}
          <Link href="/productos" className="hover:text-foreground">Productos</Link>
          {parent && (
            <>
              {' / '}
              <Link href={`/categorias/${parent.slug}`} className="hover:text-foreground">{parent.name}</Link>
            </>
          )}
          {' / '}
          <span className="text-foreground">{category.name}</span>
        </nav>
        <h1 className="text-2xl font-bold">{category.name}</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
          {cleanDescription(category.description) ? `${cleanDescription(category.description)}. ` : ''}
          {result.total > 0 ? `${result.total} referencias disponibles` : 'Catálogo en actualización'} con precios en pesos
          colombianos y envío a toda Colombia. ¿Necesitas una referencia específica? Escríbenos y te asesoramos.
        </p>
        {subcategories.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-4">
            {subcategories.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={`/categorias/${sub.slug}`}
                  className="inline-block px-3 py-1 rounded-full border text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!result.data.length ? (
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
              <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                {p.image ? (
                  <Image
                    src={imageUrl(p.image)}
                    alt={p.name.trim()}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Package className="size-10 text-muted-foreground/20" />
                )}
              </div>
              <div className="p-3">
                <h2 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{p.name.trim()}</h2>
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

      {result.totalPages > 1 && (
        <nav aria-label="Paginación" className="flex justify-center gap-2 mt-8">
          {result.page > 1 && (
            <Link href={categoryPath(category.slug, result.page - 1)} rel="prev" className="px-4 py-2 rounded-lg border text-sm hover:bg-muted">Anterior</Link>
          )}
          <span className="px-4 py-2 text-sm text-muted-foreground">{result.page} / {result.totalPages}</span>
          {result.page < result.totalPages && (
            <Link href={categoryPath(category.slug, result.page + 1)} rel="next" className="px-4 py-2 rounded-lg border text-sm hover:bg-muted">Siguiente</Link>
          )}
        </nav>
      )}
    </div>
  )
}
