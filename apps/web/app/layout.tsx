import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imprelapp.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Imprelapp — Herramientas y Ferretería para tu Negocio',
    template: '%s | Imprelapp',
  },
  description: 'Imprelapp: importadora de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad, rodillos, repuestos automotrices, equipo de carga y ferretería en general. Envíos a toda Colombia.',
  keywords: ['herramientas', 'ferretería', 'taladros', 'rodamientos', 'cadenas', 'reductores', 'variadores de velocidad', 'rodillos', 'repuestos automotrices', 'carretillas', 'Colombia'],
  openGraph: {
    siteName: 'Imprelapp',
    locale: 'es_CO',
    type: 'website',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
