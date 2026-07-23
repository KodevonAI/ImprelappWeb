import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug } from '@/lib/data/public'
import { formatCOP } from '@/lib/format'
import { ContactForm } from '@/components/public/contact-form'
import { AddToCartButton } from '@/components/public/add-to-cart-button'
import { Package, MessageCircle, ChevronRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '573000000000'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = await getProductBySlug(slug)
  if (!p) return { title: 'Producto' }
  return {
    title: p.name,
    description: p.description ?? `${p.name} — disponible en Imprelapp`,
    openGraph: { title: p.name, description: p.description ?? undefined },
  }
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const whatsappText = encodeURIComponent(
    `Hola, estoy interesado en el producto: *${product.name}* (${formatCOP(product.price)}). ¿Tienen disponibilidad?`
  )

  const images = product.images ?? []
  const firstImage = images[0]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
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
        <span className="text-foreground truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl border bg-muted overflow-hidden">
            {firstImage ? (
              <Image
                src={firstImage.url.startsWith('/') ? `${API_URL}${firstImage.url}` : firstImage.url}
                alt={firstImage.alt ?? product.name}
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="size-24 text-muted-foreground/20" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img) => (
                <div key={img.id} className="h-16 w-16 shrink-0 rounded-lg border overflow-hidden bg-muted">
                  <Image
                    src={img.url.startsWith('/') ? `${API_URL}${img.url}` : img.url}
                    alt={img.alt ?? ''}
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
          <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

          {product.sku && (
            <p className="text-sm text-muted-foreground">Ref: {product.sku}</p>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatCOP(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">{formatCOP(product.comparePrice)}</span>
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
                name={product.name}
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

          {product.description && (
            <div className="pt-4 border-t">
              <h2 className="font-semibold mb-2">Descripción</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact form */}
      <div className="mt-14 max-w-lg">
        <h2 className="text-xl font-bold mb-6">¿Preguntas sobre este producto?</h2>
        <ContactForm productId={product.id} productName={product.name} />
      </div>
    </div>
  )
}
