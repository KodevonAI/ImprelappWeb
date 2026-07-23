'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { updateOrder } from '../actions'
import { toast } from 'sonner'
import type { Order, OrderStatus, PaymentTerm } from '@imprelapp/types'

const statusLabels: Record<OrderStatus, string> = {
  nuevo: 'Nuevo',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const paymentTermLabels: Record<PaymentTerm, string> = {
  contado: 'Contado',
  credito_30: 'Crédito 30 días',
  credito_60: 'Crédito 60 días',
  credito_90: 'Crédito 90 días',
}

const paymentStatusLabels: Record<Order['paymentStatus'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  pagado: { label: 'Pagado', variant: 'default' },
  vencido: { label: 'Vencido', variant: 'destructive' },
}

export function OrderManage({ order }: { order: Order }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [paymentTerm, setPaymentTerm] = useState<PaymentTerm | ''>(order.paymentTerm ?? '')
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [dueDate, setDueDate] = useState(order.dueDate)

  function save() {
    startTransition(async () => {
      try {
        await updateOrder(order.id, {
          status,
          paymentTerm: paymentTerm || undefined,
        })
        toast.success('Pedido actualizado')
      } catch {
        toast.error('Error al actualizar')
      }
    })
  }

  function markAsPaid() {
    startTransition(async () => {
      try {
        await updateOrder(order.id, { paymentStatus: 'pagado' })
        setPaymentStatus('pagado')
        toast.success('Pedido marcado como pagado')
      } catch {
        toast.error('Error al actualizar')
      }
    })
  }

  function cancelOrder() {
    startTransition(async () => {
      try {
        await updateOrder(order.id, { status: 'cancelado' })
        setStatus('cancelado')
        toast.success('Pedido cancelado')
      } catch {
        toast.error('Error al cancelar')
      }
    })
  }

  return (
    <div className="rounded-xl border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Gestión del pedido</h2>
        <Badge variant={paymentStatusLabels[paymentStatus].variant}>
          {paymentStatusLabels[paymentStatus].label}
        </Badge>
      </div>

      {dueDate && (
        <p className="text-sm text-muted-foreground">
          Vence: {new Date(dueDate).toLocaleDateString('es-CO')}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Estado</label>
          <Select value={status} onValueChange={(v) => v && setStatus(v as OrderStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Plazo de pago</label>
          <Select
            value={paymentTerm}
            onValueChange={(v) => {
              setPaymentTerm((v as PaymentTerm) ?? '')
              if (v === 'contado') setDueDate(null)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin asignar</SelectItem>
              {Object.entries(paymentTermLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={save} disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>

        {paymentStatus !== 'pagado' && (
          <Button variant="outline" onClick={markAsPaid} disabled={isPending}>
            Marcar como pagado
          </Button>
        )}

        {status !== 'cancelado' && (
          <AlertDialog>
            <AlertDialogTrigger
              className="ml-auto inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              Cancelar pedido
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar este pedido?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Volver</AlertDialogCancel>
                <AlertDialogAction
                  onClick={cancelOrder}
                  disabled={isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Cancelar pedido
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
