import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCategoriesFlat, getCategoryBySlug, getProducts } from '@/lib/data/public'
import { Package } from 'lucide-react'
import { ProductCard } from '@/components/public/product-card'
import { CATEGORY_GUIDES } from '@/lib/category-guides'
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

  // The guide only renders on page 1 so paginated URLs don't duplicate it.
  const guide = page === 1 ? CATEGORY_GUIDES[category.slug] : undefined
  const faqJsonLd = guide && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <JsonLd data={[collectionJsonLd, breadcrumbJsonLd(crumbs), ...(faqJsonLd ? [faqJsonLd] : [])]} />
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {result.data.map((p, i) => (
                <ProductCard key={p.id} product={p} as="h2" priority={i < 4} />
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
      {guide && (
        <section id="guia-seccion" aria-labelledby="guia" className="mt-14 scroll-mt-40 grid gap-10 border-t pt-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 id="guia" className="scroll-mt-40 text-xl font-bold sm:text-2xl">{guide.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide.intro}</p>
            {guide.sections.map((sec) => (
              <div key={sec.heading} className="mt-6">
                <h3 className="font-semibold">{sec.heading}</h3>
                {sec.body.map((para) => (
                  <p key={para} className="mt-2 text-sm leading-relaxed text-slate-700">{para}</p>
                ))}
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-lg font-bold">Preguntas frecuentes</h2>
            <div className="mt-3 divide-y rounded-xl border bg-white">
              {guide.faqs.map(({ q, a }) => (
                <details key={q} className="group p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                    {q}
                    <span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
