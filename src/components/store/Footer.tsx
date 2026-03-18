import Link from "next/link";
import { Wrench, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1B3A6B] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#F97316] p-2 rounded">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">IMPRELAPP</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Tu ferretería industrial de confianza. Rodamientos, piñones, correas y
              todo lo que necesitas para mantener tu maquinaria funcionando.
            </p>
            <div className="flex flex-col gap-2 text-sm text-blue-200">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#F97316]" />
                <span>+57 300 000 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#F97316]" />
                <span>info@imprelapp.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#F97316]" />
                <span>Colombia</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4 text-[#F97316]">Categorías</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/productos?categoria=rodamientos" className="hover:text-white transition-colors">Rodamientos</Link></li>
              <li><Link href="/productos?categoria=pinones" className="hover:text-white transition-colors">Piñones</Link></li>
              <li><Link href="/productos?categoria=correas" className="hover:text-white transition-colors">Correas</Link></li>
              <li><Link href="/productos?categoria=ferreteria" className="hover:text-white transition-colors">Ferretería</Link></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[#F97316]">Enlaces</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/productos" className="hover:text-white transition-colors">Catálogo</Link></li>
              <li><Link href="/#nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
              <li><Link href="/auth/signin" className="hover:text-white transition-colors">Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-700 mt-8 pt-8 text-center text-sm text-blue-300">
          <p>© {new Date().getFullYear()} Imprelapp. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
