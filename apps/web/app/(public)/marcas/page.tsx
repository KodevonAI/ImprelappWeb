import Link from 'next/link'
import { BrandGrid } from '@/components/public/brand-grid'
import { BRANDS } from '@/lib/brands'
import { JsonLd, SITE_URL, breadcrumbJsonLd, pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Marcas: rodamientos, correas y herramientas',
  description:
    'Marcas que maneja Imprelapp en Colombia: rodamientos ZSG, KML y Koyo, correas Starflex, herramientas INGCO y Uduke, abrasivos Norton y más.',
  path: '/marcas',
})

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Marcas en Imprelapp',
    url: `${SITE_URL}/marcas`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: BRANDS.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/marcas/${b.slug}`,
        name: b.name,
      })),
    },
  },
  breadcrumbJsonLd([
    { name: 'Inicio', path: '/' },
    { name: 'Marcas', path: '/marcas' },
  ]),
]

export default function MarcasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <JsonLd data={jsonLd} />
      <nav aria-label="Migas de pan" className="mb-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Inicio</Link>
        {' / '}
        <span className="text-foreground">Marcas</span>
      </nav>
      <h1 className="text-2xl font-bold sm:text-3xl">Marcas que manejamos</h1>
      <p className="mb-6 mt-2 max-w-3xl text-sm text-muted-foreground">
        Rodamientos, chumaceras, correas, herramientas y ferretería de las marcas que manejamos, con envío a toda Colombia.
        Elige una marca para ver todas sus referencias disponibles.
      </p>
      <BrandGrid />
    </div>
  )
}
