import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import type { ProductListItemPublic } from '@imprelapp/types'
import { getCategories, getProducts } from '@/lib/data/public'
import { MessageCircle } from 'lucide-react'
import { JsonLd, WHATSAPP_NUMBER, imageUrl, pageMetadata } from '@/lib/seo'
import { detectBrand } from '@/lib/brands'
import { CategoryIcon, discountPercent } from '@/lib/category-ui'
import { ProductCard } from '@/components/public/product-card'
import { Rail, RailItem } from '@/components/public/rail'
import { HeroCarousel, type HeroSlide } from '@/components/public/hero-carousel'
import { BrandGrid } from '@/components/public/brand-grid'

export const metadata: Metadata = pageMetadata({
  title: 'Imprelapp | Herramientas, Rodamientos y Ferretería en Colombia',
  absoluteTitle: true,
  description: 'Importadora de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores y ferretería. Envíos a toda Colombia. Pide por WhatsApp.',
  path: '/',
})

const faqs = [
  {
    q: '¿Qué productos vende Imprelapp?',
    a: 'Imprelapp es una importadora de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad, rodillos, repuestos automotrices, carretillas y equipos de carga, y ferretería en general para talleres, industrias y negocios.',
  },
  {
    q: '¿Hacen envíos a toda Colombia?',
    a: 'Sí. Despachamos pedidos a todo el territorio colombiano. Los precios del catálogo están en pesos colombianos (COP).',
  },
  {
    q: '¿Cómo hago un pedido?',
    a: 'Agrega los productos al carrito y confirma el pedido con tus datos de contacto y entrega, o escríbenos directamente por WhatsApp. Te contactamos para confirmar disponibilidad y detalles del envío.',
  },
  {
    q: '¿Ofrecen asesoría técnica para elegir un producto?',
    a: 'Sí. Si no sabes qué referencia de rodamiento, cadena, reductor o herramienta necesitas, escríbenos por WhatsApp o por el formulario de contacto y te ayudamos a elegir.',
  },
  {
    q: '¿Qué hago si no encuentro un producto en el catálogo?',
    a: 'Contáctanos por WhatsApp con la referencia o una foto del repuesto. Te ayudamos a conseguirlo aunque no aparezca publicado en la tienda.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

// Rails show photographed products first so the home page looks complete
// even though many catalog items have no image yet.
function imagesFirst(list: ProductListItemPublic[]) {
  return [...list].sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
}

function heroImages(list: ProductListItemPublic[]) {
  return list
    .filter((p) => p.image)
    .slice(0, 3)
    .map((p) => ({ src: imageUrl(p.image!), alt: p.name.trim() }))
}

function SectionHeader({ title, subtitle, href, id }: { title: string; subtitle?: string; href?: string; id?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-semibold text-primary hover:underline">
          Ver todo →
        </Link>
      )}
    </div>
  )
}

export default async function HomePage() {
  const categories = (await getCategories()).filter((c) => !c.parentId)
  const [featured, ...byCategory] = await Promise.all([
    getProducts({ featured: true, pageSize: 24 }),
    ...categories.map((c) => getProducts({ categoryId: c.id, pageSize: 24 })),
  ])

  const sections = categories
    .map((cat, i) => ({ cat, total: byCategory[i].total, products: imagesFirst(byCategory[i].data) }))
  const pool = sections.flatMap((s) => s.products)
  const find = (slug: string) => sections.find((s) => s.cat.slug === slug)?.products ?? []

  // Only a couple of products carry a real markdown, so the deals rail falls back
  // to featured products until there are enough discounts to fill it.
  const discounted = pool
    .filter((p) => p.inStock && discountPercent(p.price, p.comparePrice))
    .sort((a, b) => discountPercent(b.price, b.comparePrice)! - discountPercent(a.price, a.comparePrice)!)
  const showDeals = discounted.length >= 5
  const spotlight = showDeals ? imagesFirst(discounted).slice(0, 15) : imagesFirst(featured.data).slice(0, 15)

  const starflex = pool.filter((p) => detectBrand(p.name)?.name === 'Starflex')
  const slides: HeroSlide[] = [
    {
      eyebrow: 'Importadora · Envíos a toda Colombia',
      title: 'Herramientas, rodamientos y ferretería para tu negocio',
      text: 'Más de 500 referencias para talleres, industria y mantenimiento, con asesoría técnica por WhatsApp.',
      cta: { label: 'Ver catálogo', href: '/productos' },
      images: heroImages(imagesFirst(featured.data).length ? imagesFirst(featured.data) : pool),
      tone: 'from-primary via-blue-800 to-slate-900',
    },
    {
      eyebrow: 'Rodamientos · Chumaceras',
      title: 'Rodamientos ZSG y Koyo',
      text: 'Rígidos de bolas, sellados 2RS, chumaceras UCP y UCF en medidas métricas y en pulgadas.',
      cta: { label: 'Ver rodamientos', href: '/categorias/rodamientos' },
      images: heroImages(find('rodamientos')),
      tone: 'from-slate-900 via-slate-800 to-primary',
    },
    {
      eyebrow: 'Herramienta manual',
      title: 'Llaves, copas y juegos de herramientas',
      text: 'Llaves mixtas, copas de cuadrante, alicates y más para el trabajo diario del taller.',
      cta: { label: 'Ver herramientas', href: '/categorias/herramientas-manuales' },
      images: heroImages(find('herramientas-manuales')),
      tone: 'from-blue-900 via-primary to-sky-700',
    },
    ...(starflex.length
      ? [
          {
            eyebrow: 'Transmisión de potencia',
            title: 'Correas industriales Starflex',
            text: 'Correas en V para maquinaria industrial y agrícola. Consulta tu referencia.',
            cta: { label: 'Ver correas', href: '/productos?search=Starflex' },
            images: heroImages(starflex),
            tone: 'from-slate-900 via-blue-950 to-blue-800',
          },
        ]
      : []),
  ]

  const rails = ['rodamientos', 'herramientas-manuales', 'ferreteria-en-general', 'herramientas-electricas']
    .map((slug) => sections.find((s) => s.cat.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s && s.products.length))

  return (
    <div className="bg-slate-50">
      <JsonLd data={faqJsonLd} />

      {/* Category shortcuts */}
      <nav aria-label="Comprar por categoría" className="border-b bg-white">
        <ul className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-5 [scrollbar-width:none] lg:justify-between">
          {sections.map(({ cat, products, total }) => {
            const img = products.find((p) => p.image)?.image
            return (
              <li key={cat.slug} className="shrink-0">
                <Link href={`/categorias/${cat.slug}`} className="group flex w-20 flex-col items-center gap-2 text-center sm:w-24">
                  <span className="relative flex size-18 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-white transition group-hover:border-primary sm:size-20">
                    {img ? (
                      <Image src={imageUrl(img)} alt="" fill sizes="80px" className="object-contain p-2.5" />
                    ) : (
                      <CategoryIcon slug={cat.slug} className="size-8 text-primary" strokeWidth={1.5} />
                    )}
                  </span>
                  <span className="text-xs font-medium leading-tight text-slate-700 group-hover:text-primary">{cat.name}</span>
                  {total > 0 && <span className="sr-only">{total} productos</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-6 sm:py-8">
        <HeroCarousel slides={slides} />

        {spotlight.length > 0 && (
          <section aria-labelledby="destacados">
            <SectionHeader
              id="destacados"
              title={showDeals ? '¡Aprovecha y ahorra!' : 'Productos destacados'}
              subtitle={showDeals ? 'Productos con precio rebajado' : 'Selección de nuestro catálogo'}
              href="/productos"
            />
            <Rail label={showDeals ? 'Ofertas' : 'Destacados'}>
              {spotlight.map((p, i) => (
                <RailItem key={p.id}>
                  <ProductCard product={p} className="h-full" priority={i < 2} />
                </RailItem>
              ))}
            </Rail>
          </section>
        )}

        {rails.map(({ cat, products, total }) => (
          <section key={cat.slug} aria-labelledby={`rail-${cat.slug}`}>
            <SectionHeader
              id={`rail-${cat.slug}`}
              title={cat.name}
              subtitle={`${total} referencias disponibles`}
              href={`/categorias/${cat.slug}`}
            />
            <Rail label={cat.name}>
              {products.slice(0, 15).map((p) => (
                <RailItem key={p.id}>
                  <ProductCard product={p} className="h-full" />
                </RailItem>
              ))}
            </Rail>
          </section>
        ))}

        <section aria-labelledby="marcas">
          <SectionHeader id="marcas" title="Marcas que manejamos" subtitle="Encuentra productos por marca" href="/marcas" />
          <BrandGrid />
        </section>

        <section className="overflow-hidden rounded-2xl bg-primary px-6 py-10 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold">¿No encuentras lo que buscas?</h2>
          <p className="mx-auto mt-2 max-w-xl text-blue-100">
            Envíanos la referencia o una foto del repuesto por WhatsApp y te ayudamos a conseguirlo.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, necesito ayuda para encontrar un producto')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-green-500 px-6 text-sm font-semibold text-white transition hover:bg-green-400"
          >
            <MessageCircle className="size-5" /> Chatear por WhatsApp
          </a>
        </section>

        <section aria-labelledby="preguntas-frecuentes" className="mx-auto max-w-3xl scroll-mt-40">
          <h2 id="preguntas-frecuentes" className="mb-5 text-center text-xl font-bold sm:text-2xl">Preguntas frecuentes</h2>
          <div className="divide-y rounded-xl border bg-white">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                  {q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
