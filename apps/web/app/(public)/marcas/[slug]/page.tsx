import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAllProducts } from '@/lib/data/public'
import { BRANDS, brandBySlug, type Brand } from '@/lib/brands'
import { JsonLd, SITE_URL, breadcrumbJsonLd, pageMetadata, truncate } from '@/lib/seo'
import { ProductCard } from '@/components/public/product-card'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }))
}

async function brandProducts(brand: Brand) {
  const all = await getAllProducts()
  return all
    .filter((p) => brand.pattern.test(p.name))
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)) || a.name.localeCompare(b.name, 'es'))
}

function describe(brand: Brand, count: number) {
  const refs = count === 1 ? '1 referencia' : `${count} referencias`
  return truncate(
    `${brand.name} en Imprelapp: ${refs} de ${brand.tagline.toLowerCase()}. Precios en COP, envío a toda Colombia y asesoría por WhatsApp.`
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = brandBySlug(slug)
  if (!brand) return { title: 'Marca no encontrada', robots: { index: false } }
  const products = await brandProducts(brand)
  return pageMetadata({
    title: `${brand.name}: ${brand.tagline} en Colombia`,
    description: describe(brand, products.length),
    path: `/marcas/${brand.slug}`,
    images: brand.logo ? [{ url: brand.logo.src, width: brand.logo.width, height: brand.logo.height, alt: brand.name }] : undefined,
    // A brand with no published products would be a thin page.
    noindex: products.length === 0,
  })
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = brandBySlug(slug)
  if (!brand) notFound()

  const products = await brandProducts(brand)
  const categories = [
    ...new Map(
      products.filter((p) => p.categorySlug && p.categoryName).map((p) => [p.categorySlug!, p.categoryName!])
    ),
  ]
  const url = `${SITE_URL}/marcas/${brand.slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Productos ${brand.name}`,
      url,
      description: describe(brand, products.length),
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@type': 'Brand', name: brand.name, ...(brand.logo ? { logo: `${SITE_URL}${brand.logo.src}` } : {}) },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: products.length,
        itemListElement: products.slice(0, 50).map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/productos/${p.slug}`,
          name: p.name.trim(),
        })),
      },
    },
    breadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Marcas', path: '/marcas' },
      { name: brand.name, path: `/marcas/${brand.slug}` },
    ]),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <JsonLd data={jsonLd} />
      <nav aria-label="Migas de pan" className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        {' / '}
        <Link href="/marcas" className="hover:text-foreground">Marcas</Link>
        {' / '}
        <span className="text-foreground">{brand.name}</span>
      </nav>

      <header className="mb-8 flex flex-col gap-5 rounded-2xl border bg-white p-6 sm:flex-row sm:items-center">
        <div className="flex h-24 w-40 shrink-0 items-center justify-center rounded-xl border bg-white px-4">
          {brand.logo ? (
            <Image src={brand.logo.src} alt={brand.name} width={brand.logo.width} height={brand.logo.height} className="h-14 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-black uppercase italic tracking-tight text-slate-800">{brand.name}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Productos {brand.name}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            En Imprelapp encuentras {products.length === 1 ? '1 referencia' : `${products.length} referencias`} {brand.name} de{' '}
            {brand.tagline.toLowerCase()}, con precios en
            pesos colombianos y envío a toda Colombia. ¿Buscas una referencia {brand.name} que no aparece? Escríbenos por WhatsApp
            y te ayudamos a conseguirla.
          </p>
          {categories.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories.map(([catSlug, catName]) => (
                <li key={catSlug}>
                  <Link
                    href={`/categorias/${catSlug}`}
                    className="inline-block rounded-full border px-3 py-1 text-xs hover:border-primary hover:text-primary"
                  >
                    {catName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">Pronto publicaremos productos {brand.name}.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} as="h2" priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  )
}
