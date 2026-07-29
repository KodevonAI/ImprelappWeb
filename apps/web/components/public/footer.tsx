import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin } from 'lucide-react'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? '573207360233'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="/logo-icon.png" alt="Imprelapp" width={32} height={32} className="h-8 w-8 bg-white rounded-lg p-1" />
            <span className="font-bold text-white">IMPRELAPP</span>
          </div>
          <p className="text-sm text-gray-400">Herramientas, repuestos y equipo para tu negocio. Colombia.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3 text-sm">Categorías</p>
          <ul className="space-y-1.5 text-sm">
            {['Herramientas Eléctricas', 'Herramientas Manuales', 'Repuestos Automotrices', 'Carretillas y Equipos'].map((cat) => (
              <li key={cat}>
                <Link href={`/productos?search=${cat.toLowerCase()}`} className="hover:text-white transition-colors">{cat}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3 text-sm">Contacto</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-3.5 shrink-0" />
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-3.5 shrink-0" />
              <Link href="/contacto" className="hover:text-white">Escríbenos</Link>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="size-3.5 shrink-0 mt-0.5" />
              <span>Colombia</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Imprelapp. Todos los derechos reservados.
      </div>
    </footer>
  )
}
