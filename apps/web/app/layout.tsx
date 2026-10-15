import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { DEFAULT_OG_IMAGE, JsonLd, SITE_NAME, SITE_URL, organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Imprelapp | Herramientas, Rodamientos y Ferretería en Colombia',
    template: '%s | Imprelapp',
  },
  description: 'Imprelapp: importadora de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad, rodillos, repuestos automotrices, equipo de carga y ferretería en general. Envíos a toda Colombia.',
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale: 'es_CO',
    type: 'website',
    url: SITE_URL,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        {children}
      </body>
    </html>
  )
}
