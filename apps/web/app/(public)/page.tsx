import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories, getProducts } from '@/lib/data/public'
import { formatCOP } from '@/lib/format'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, MessageCircle, Wrench, Package, Zap } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export const metadata: Metadata = {
  title: 'Imprelapp — Herramientas y Ferretería para tu Negocio',
  description: 'Importadora de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad, rodillos, repuestos automotrices, equipo de carga y ferretería en general. Envíos a toda Colombia. Pide por WhatsApp.',
  openGraph: { title: 'Imprelapp', description: 'Herramientas, rodamientos, cadenas, reductores, variadores de velocidad y ferretería en general en Colombia' },
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? '573207360233'

const defaultCategories = [
  { name: 'Herramientas Eléctricas', icon: '🔌', slug: '' },
  { name: 'Herramientas Manuales', icon: '🔧', slug: '' },
  { name: 'Repuestos Automotrices', icon: '⚙️', slug: '' },
  { name: 'Carretillas y Equipos', icon: '🛠️', slug: '' },
]

export default async function HomePage() {
  const [categories, productList] = await Promise.all([
    getCategories(),
    getProducts({ pageSize: 24 }),
  ])
  const products = productList.data

  const topCategories = categories.filter((c) => !c.parentId).slice(0, 6)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
            Herramientas y Ferretería<br />
            <span className="text-blue-200">para tu negocio</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad,
            rodillos, repuestos automotrices, carretillas y ferretería en general. Entregamos en toda Colombia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="#categorias" className={cn(buttonVariants({ size: 'lg' }), 'bg-white text-primary hover:bg-blue-50 font-semibold')}>
              Ver catálogo completo <ArrowRight className="size-4 ml-1" />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola, me interesa conocer sus productos`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'bg-transparent border-white text-white hover:bg-white/10 dark:bg-transparent')}
            >
              <MessageCircle className="size-4 mr-1.5" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Package, label: 'Amplio catálogo', desc: 'Miles de referencias' },
            { icon: Zap, label: 'Despacho rápido', desc: 'Entrega a todo el país' },
            { icon: Wrench, label: 'Asesoría técnica', desc: 'Te ayudamos a elegir' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl bg-card border">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="max-w-7xl mx-auto px-4 py-12 scroll-mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Categorías</h2>
          <Link href="/productos" className="text-sm text-primary hover:underline">Ver todo →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(topCategories.length ? topCategories : defaultCategories).map((cat, i) => (
            <Link
              key={cat.slug || i}
              href={cat.slug ? `/categorias/${cat.slug}` : '/productos'}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:border-primary hover:shadow-sm transition-all text-center"
            >
              <span className="text-3xl">{'icon' in cat ? (cat as { icon?: string }).icon ?? '📦' : '📦'}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Product listing */}
      {products.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nuestros productos</h2>
              <Link href="/productos" className="text-sm text-primary hover:underline">Ver catálogo completo →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/productos/${p.slug}`}
                  className="rounded-xl border bg-card hover:shadow-md transition-shadow overflow-hidden group"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {p.image ? (
                      <Image
                        src={p.image.startsWith('/') ? `${API_URL}${p.image}` : p.image}
                        alt={p.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="size-12 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
                    <p className="text-primary font-bold text-sm mt-1">{formatCOP(p.price)}</p>
                    {!p.inStock && (
                      <p className="text-xs text-destructive mt-0.5">Sin stock</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="bg-primary text-white py-14 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">¿No encuentras lo que buscas?</h2>
        <p className="text-blue-100 mb-6">Contáctanos por WhatsApp y te ayudamos a conseguirlo.</p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola, necesito ayuda para encontrar un producto`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: 'lg' }), 'bg-green-500 hover:bg-green-400 text-white font-semibold')}
        >
          <MessageCircle className="size-5 mr-2" /> Chatear por WhatsApp
        </a>
      </section>
    </>
  )
}
