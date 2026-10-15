import Link from 'next/link'
import Image from 'next/image'
import { Headset, Mail, MapPin, MessageCircle, ShieldCheck, Truck } from 'lucide-react'
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from '@/lib/seo'

interface FooterProps {
  categoryLinks?: Array<{ name: string; slug: string }>
}

const services = [
  { icon: Truck, title: 'Envíos a toda Colombia', text: 'Despachamos a cualquier ciudad del país.' },
  { icon: Headset, title: 'Asesoría técnica', text: 'Te ayudamos a elegir la referencia correcta.' },
  { icon: MessageCircle, title: 'Pedidos por WhatsApp', text: 'Cotiza y confirma tu pedido en minutos.' },
  { icon: ShieldCheck, title: 'Precios en COP', text: 'Precios claros publicados en el catálogo.' },
]

export function Footer({ categoryLinks = [] }: FooterProps) {
  return (
    <footer className="mt-auto">
      {/* Services strip */}
      <section aria-label="Servicios" className="border-t bg-slate-50">
        <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="bg-slate-900 text-slate-300">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Image src="/logo-icon.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg bg-white p-1" />
              <span className="font-bold text-white">IMPRELAPP</span>
            </div>
            <p className="text-sm text-slate-400">
              Importadora de herramientas, rodamientos, correas, cadenas, repuestos y ferretería en general. Envíos a toda Colombia.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Categorías</p>
            <ul className="space-y-1.5 text-sm">
              {categoryLinks.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categorias/${cat.slug}`} className="transition-colors hover:text-white">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Compra</p>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/productos" className="hover:text-white">Catálogo completo</Link></li>
              <li><Link href="/marcas" className="hover:text-white">Marcas</Link></li>
              <li><Link href="/carrito" className="hover:text-white">Mi carrito</Link></li>
              <li><Link href="/#preguntas-frecuentes" className="hover:text-white">Preguntas frecuentes</Link></li>
              <li><Link href="/contacto" className="hover:text-white">Cotizaciones</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Contacto</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white">
                  <MessageCircle className="size-4 shrink-0" /> +{WHATSAPP_NUMBER}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-white">
                  <Mail className="size-4 shrink-0" /> {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" /> Colombia
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Imprelapp. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
