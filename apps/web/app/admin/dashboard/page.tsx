import { AdminHeader } from '@/components/admin/header'
import { serverGet } from '@/lib/server-api'
import { Badge } from '@/components/ui/badge'
import { Package, Tag, MessageSquare, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/format'

interface DashboardData {
  totalProducts: number
  totalCategories: number
  newMessages: number
  lowStock: number
  recentMessages: Array<{
    id: number
    name: string
    subject: string
    createdAt: string
    status: 'new' | 'read' | 'replied'
  }>
}

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  new: { label: 'Nuevo', variant: 'default' },
  read: { label: 'Leído', variant: 'secondary' },
  replied: { label: 'Respondido', variant: 'outline' },
}

export default async function DashboardPage() {
  let data: DashboardData | null = null
  let error = false

  try {
    data = await serverGet<DashboardData>('/api/dashboard')
  } catch {
    error = true
  }

  const stats = [
    { label: 'Productos activos', value: data?.totalProducts ?? '—', icon: Package, color: 'text-blue-600' },
    { label: 'Categorías', value: data?.totalCategories ?? '—', icon: Tag, color: 'text-violet-600' },
    { label: 'Mensajes nuevos', value: data?.newMessages ?? '—', icon: MessageSquare, color: 'text-green-600' },
    { label: 'Bajo stock (≤5)', value: data?.lowStock ?? '—', icon: AlertTriangle, color: 'text-orange-500' },
  ]

  return (
    <>
      <AdminHeader title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            No se pudo conectar con la API. Verifica que el backend esté corriendo.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="px-5 py-4 border-b">
            <h2 className="font-medium text-sm">Últimos mensajes</h2>
          </div>
          {!data?.recentMessages?.length ? (
            <p className="px-5 py-8 text-sm text-muted-foreground text-center">Sin mensajes aún</p>
          ) : (
            <div className="divide-y">
              {data.recentMessages.map((msg) => (
                <div key={msg.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{msg.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{msg.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={statusLabel[msg.status]?.variant ?? 'secondary'}>
                      {statusLabel[msg.status]?.label ?? msg.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(msg.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
