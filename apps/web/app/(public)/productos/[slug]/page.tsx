import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, getProducts } from '@/lib/data/public'
import { formatCOP } from '@/lib/format'
import { CategoryIcon, discountPercent } from '@/lib/category-ui'
import { productSpecs } from '@/lib/specs'
import { detectBrand } from '@/lib/brands'
import { ProductCard } from '@/components/public/product-card'
import { Rail, RailItem } from '@/components/public/rail'
import { ContactForm } from '@/components/public/contact-form'
import { AddToCartButton } from '@/components/public/add-to-cart-button'
import { MessageCircle, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ProductPublic } from '@imprelapp/types'
import {
  JsonLd,
  SITE_URL,
  WHATSAPP_NUMBER as WHATSAPP,
  breadcrumbJsonLd,
  imageUrl,
  pageMetadata,
  truncate,
} from '@/lib/seo'

function productDescription(p: ProductPublic, name: string): string {
  if (p.description?.trim()) return truncate(p.description)
  const specs = productSpecs(name, p.category?.slug)
  const parts = [
    specs ? `${specs.summary} ${formatCOP(p.price)}.` : `${name}${p.category ? ` (${p.category.name})` : ''} a ${formatCOP(p.price)}.`,
    !specs && p.sku ? `Ref. ${p.sku}.` : '',
    p.inStock ? 'Disponible para envío a toda Colombia.' : 'Consulta disponibilidad.',
    'Pide en línea o por WhatsApp.',
  ]
  return truncate(parts.filter(Boolean).join(' '))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProductBySlug(slug)
  if (!p) return { title: 'Producto no encontrado', robots: { index: false } }
  const name = p.name.trim()
  const hint = productSpecs(name, p.category?.slug)?.titleHint
  return pageMetadata({
    title: hint ? `${name} (${hint})` : name,
    description: productDescription(p, name),
    path: `/productos/${p.slug}`,
    images: (p.images ?? []).slice(0, 4).map((img) => ({ url: imageUrl(img.url), alt: img.alt ?? name })),
  })
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const name = product.name.trim()
  const productUrl = `${SITE_URL}/productos/${product.slug}`
  const specs = productSpecs(name, product.category?.slug)
  const brand = detectBrand(name)
  const related = product.categoryId
    ? (await getProducts({ categoryId: product.categoryId, pageSize: 24 })).data
        .filter((p) => p.id !== product.id)
        .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
        .slice(0, 12)
    : []
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url: productUrl,
    description: productDescription(product, name),
    // Google rejects SKUs with quotes or whitespace (e.g. `BV/S/100 4"`); mpn keeps the raw reference.
    ...(product.sku ? { mpn: product.sku } : {}),
    ...(product.sku && /^[\w./-]+$/.test(product.sku) ? { sku: product.sku } : {}),
    ...(product.images?.length ? { image: product.images.map((img) => imageUrl(img.url)) } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand.name } } : {}),
    ...(specs
      ? {
          additionalProperty: specs.rows
            .filter((r) => r.label !== 'Tipo')
            .map((r) => ({ '@type': 'PropertyValue', name: r.label, value: r.value })),
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: Number(product.price).toFixed(0),
      priceCurrency: 'COP',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
      areaServed: 'CO',
    },
  }
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
    ...(product.category ? [{ name: product.category.name, path: `/categorias/${product.category.slug}` }] : []),
    { name, path: `/productos/${product.slug}` },
  ]

  const whatsappText = encodeURIComponent(
    `Hola, estoy interesado en el producto: *${name}* (${formatCOP(product.price)}). ¿Tienen disponibilidad?`
  )

  const images = product.images ?? []
  const firstImage = images[0]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd(crumbs)]} />
      {/* Breadcrumb */}
      <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/productos" className="hover:text-foreground">Productos</Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" />
            <Link href={`/categorias/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="text-foreground truncate max-w-xs">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl border bg-muted overflow-hidden">
            {firstImage ? (
              <Image
                src={imageUrl(firstImage.url)}
                alt={firstImage.alt || name}
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                <CategoryIcon slug={product.category?.slug} className="size-24" strokeWidth={1} aria-hidden="true" />
                <span className="text-xs uppercase tracking-wider">{brand?.name ?? product.category?.name ?? 'Imprelapp'}</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <div key={img.id} className="h-16 w-16 shrink-0 rounded-lg border overflow-hidden bg-muted">
                  <Image
                    src={imageUrl(img.url)}
                    alt={img.alt || `${name} - imagen ${i + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.category && (
            <Link href={`/categorias/${product.category.slug}`} className="text-sm text-primary hover:underline">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold">{name}</h1>

          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {brand && (
              <span>
                Marca:{' '}
                <Link href={`/marcas/${brand.slug}`} className="font-medium text-primary hover:underline">
                  {brand.name}
                </Link>
              </span>
            )}
            {product.sku && <span>Ref: {product.sku}</span>}
          </p>
          {specs && <p className="text-sm leading-relaxed">{specs.summary}</p>}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatCOP(product.price)}</span>
            {discountPercent(product.price, product.comparePrice) && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatCOP(product.comparePrice!)}</span>
                <span className="rounded-md bg-red-600 px-2 py-0.5 text-sm font-bold text-white">
                  -{discountPercent(product.price, product.comparePrice)}%
                </span>
              </>
            )}
          </div>

          <div>
            {product.inStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                Sin stock
              </span>
            )}
          </div>

          <div className="space-y-3">
            {product.inStock && (
              <AddToCartButton
                productId={product.id}
                name={name}
                slug={product.slug}
                price={product.price}
              />
            )}
            <a
              href={`https://wa.me/${WHATSAPP}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: 'lg' }), 'bg-green-500 hover:bg-green-400 text-white w-full justify-center')}
            >
              <MessageCircle className="size-5 mr-2" /> Pedir por WhatsApp
            </a>
          </div>

          {specs && (
            <div className="pt-4 border-t">
              <h2 className="font-semibold mb-2">Especificaciones</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {specs.rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row" className="py-2 pr-4 text-left font-normal text-muted-foreground w-2/5">{r.label}</th>
                      <td className="py-2 font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted-foreground">
                Medidas según la designación estándar de la referencia. Confírmalas con tu pieza antes de comprar o escríbenos y te asesoramos.
              </p>
            </div>
          )}

          {product.description && (
            <div className="pt-4 border-t">
              <h2 className="font-semibold mb-2">Descripción</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && product.category && (
        <section aria-labelledby="relacionados" className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="relacionados" className="text-xl font-bold">Más en {product.category.name}</h2>
            <Link href={`/categorias/${product.category.slug}`} className="text-sm font-semibold text-primary hover:underline">
              Ver todo →
            </Link>
          </div>
          <Rail label={`Más en ${product.category.name}`}>
            {related.map((p) => (
              <RailItem key={p.id}>
                <ProductCard product={p} className="h-full" />
              </RailItem>
            ))}
          </Rail>
        </section>
      )}

      {/* Contact form */}
      <div className="mt-14 max-w-lg">
        <h2 className="text-xl font-bold mb-6">¿Preguntas sobre este producto?</h2>
        <ContactForm productId={product.id} productName={name} />
      </div>
    </div>
  )
}
