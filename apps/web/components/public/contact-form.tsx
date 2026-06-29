'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle } from 'lucide-react'

interface ContactFormProps {
  productId?: number
  productName?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function ContactForm({ productId, productName }: ContactFormProps) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone') || null,
      subject: fd.get('subject') || (productName ? `Consulta: ${productName}` : 'Consulta general'),
      body: fd.get('body'),
      productId: productId ?? null,
    }

    startTransition(async () => {
      try {
        const res = await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error()
        setSent(true)
      } catch {
        setError('Error al enviar. Intenta de nuevo o contáctanos por WhatsApp.')
      }
    })
  }

  if (sent) {
    return (
      <div className="rounded-xl border bg-green-50 p-6 text-center">
        <CheckCircle className="size-10 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-green-800">¡Mensaje enviado!</p>
        <p className="text-sm text-green-700 mt-1">Te responderemos pronto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cf-name">Nombre *</Label>
          <Input id="cf-name" name="name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">Correo *</Label>
          <Input id="cf-email" name="email" type="email" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cf-phone">Teléfono</Label>
        <Input id="cf-phone" name="phone" type="tel" placeholder="Opcional" />
      </div>
      {!productName && (
        <div className="space-y-1.5">
          <Label htmlFor="cf-subject">Asunto *</Label>
          <Input id="cf-subject" name="subject" required />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="cf-body">Mensaje *</Label>
        <Textarea
          id="cf-body"
          name="body"
          rows={4}
          required
          placeholder={productName ? `Tengo una consulta sobre ${productName}...` : 'Escribe tu mensaje...'}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Enviando...' : 'Enviar mensaje'}
      </Button>
    </form>
  )
}
