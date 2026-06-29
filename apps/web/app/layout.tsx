import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imprelapp.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Imprelapp — Rodamientos, Piñones, Correas y Ferretería',
    template: '%s | Imprelapp',
  },
  description: 'Ferretería industrial Imprelapp. Rodamientos, piñones, correas y más. Envíos a toda Colombia.',
  keywords: ['rodamientos', 'piñones', 'correas', 'ferretería industrial', 'Colombia'],
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
