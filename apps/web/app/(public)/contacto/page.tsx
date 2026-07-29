import { ContactForm } from '@/components/public/contact-form'
import { Mail, MapPin, MessageCircle } from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? '573207360233'

export const metadata = {
  title: 'Contáctanos | Imprelapp',
  description: 'Ponte en contacto con nosotros por WhatsApp, correo electrónico o mediante el formulario.',
}

export default function ContactoPage() {
  return (
      <section className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Contáctanos</h1>
        <p className="text-muted-foreground mb-10">
          Estamos aquí para ayudarte. Escríbenos y te responderemos a la brevedad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Información de contacto */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Información de contacto</h2>

            <div className="flex items-start gap-3">
              <MessageCircle className="size-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">WhatsApp</p>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +{WHATSAPP}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="size-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Correo electrónico</p>
                <a
                  href="mailto:contacto@imprelapp.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  contacto@imprelapp.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="size-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">Colombia</p>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Envíanos un mensaje</h2>
            <ContactForm />
          </div>
        </div>
      </section>
  )
}
