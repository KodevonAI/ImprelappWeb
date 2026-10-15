import type { Metadata } from 'next'

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imprelapp.com').replace(/\/$/, '')
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? '573207360233'
export const CONTACT_EMAIL = 'contacto@imprelapp.com'
export const SITE_NAME = 'Imprelapp'
export const DEFAULT_OG_IMAGE = { url: '/logo-full.png', width: 535, height: 306, alt: 'Imprelapp' }

/** Absolute URL for an image served by the API (`/uploads/...`) or already absolute. */
export function imageUrl(src: string): string {
  return src.startsWith('/') ? `${PUBLIC_API_URL}${src}` : src
}

/** Collapses whitespace and cuts at a word boundary so meta descriptions stay under ~160 chars. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:—-]+$/, '')}…`
}

/**
 * Metadata merges shallowly between segments, so a page that sets `openGraph`
 * replaces the root one entirely. Build it here so every page keeps siteName,
 * locale, url and a default image.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
  type = 'website',
  absoluteTitle = false,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
  type?: 'website' | 'article'
  absoluteTitle?: boolean
  noindex?: boolean
}): Metadata {
  const ogImages = images?.length ? images : [DEFAULT_OG_IMAGE]
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: 'es_CO',
      type,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: ogImages.map((i) => i.url),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-full.png`,
  email: CONTACT_EMAIL,
  description:
    'Importadora colombiana de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad, rodillos, repuestos automotrices, equipo de carga y ferretería en general.',
  areaServed: { '@type': 'Country', name: 'Colombia' },
  address: { '@type': 'PostalAddress', addressCountry: 'CO' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: `+${WHATSAPP_NUMBER}`,
    email: CONTACT_EMAIL,
    contactType: 'sales',
    areaServed: 'CO',
    availableLanguage: 'es',
  },
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'es-CO',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/productos?search={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}
