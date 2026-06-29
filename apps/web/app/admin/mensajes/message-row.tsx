'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DeleteDialog } from '@/components/admin/delete-dialog'
import { updateMessageStatus, deleteMessage } from './actions'
import { formatDistanceToNow } from '@/lib/format'
import { toast } from 'sonner'
import { Mail, Phone, Package } from 'lucide-react'
import type { Message } from '@imprelapp/types'

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline'; next: 'read' | 'replied' | null }> = {
  new: { label: 'Nuevo', variant: 'default', next: 'read' },
  read: { label: 'Leído', variant: 'secondary', next: 'replied' },
  replied: { label: 'Respondido', variant: 'outline', next: null },
}

type MessageWithProduct = Message & { productName?: string | null }

export function MessageRow({ msg }: { msg: MessageWithProduct }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(msg.status)
  const [loading, setLoading] = useState(false)

  const cfg = statusConfig[status] ?? statusConfig.new

  async function advance() {
    if (!cfg.next) return
    setLoading(true)
    try {
      await updateMessageStatus(msg.id, cfg.next)
      setStatus(cfg.next)
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <tr
        className="border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(true)}
      >
        <td className="px-4 py-3">
          <p className="font-medium text-sm">{msg.name}</p>
          <p className="text-xs text-muted-foreground">{msg.email}</p>
        </td>
        <td className="px-4 py-3 text-sm max-w-xs">
          <p className="truncate">{msg.subject}</p>
          {msg.productName && (
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
              <Package className="size-3" />{msg.productName}
            </p>
          )}
        </td>
        <td className="px-4 py-3">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(msg.createdAt)}
        </td>
        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
          <DeleteDialog label="mensaje" onConfirm={async () => deleteMessage(msg.id)} />
        </td>
      </tr>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{msg.subject}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{msg.email}</span>
              {msg.phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{msg.phone}</span>}
              {msg.productName && <span className="flex items-center gap-1.5"><Package className="size-3.5" />{msg.productName}</span>}
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">{msg.body}</div>
            <div className="flex items-center justify-between">
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
              {cfg.next && (
                <Button size="sm" variant="outline" onClick={advance} disabled={loading}>
                  Marcar como {statusConfig[cfg.next]?.label}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
