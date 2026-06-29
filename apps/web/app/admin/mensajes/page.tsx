import Link from 'next/link'
import { AdminHeader } from '@/components/admin/header'
import { serverGet } from '@/lib/server-api'
import { buttonVariants } from '@/components/ui/button'
import { MessageRow } from './message-row'
import { cn } from '@/lib/utils'
import type { Message, PaginatedResponse } from '@imprelapp/types'

export const metadata = { title: 'Mensajes' }

type MessageWithProduct = Message & { productName?: string | null }

const filterOptions = [
  { value: '', label: 'Todos' },
  { value: 'new', label: 'Nuevos' },
  { value: 'read', label: 'Leídos' },
  { value: 'replied', label: 'Respondidos' },
]

export default async function MensajesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const { page = '1', status = '' } = await searchParams
  const params = new URLSearchParams({ page, pageSize: '20', ...(status ? { status } : {}) })

  let result: PaginatedResponse<MessageWithProduct> | null = null
  try {
    result = await serverGet<PaginatedResponse<MessageWithProduct>>(`/api/messages?${params}`)
  } catch {}

  return (
    <>
      <AdminHeader title="Mensajes" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b flex gap-2">
            {filterOptions.map(({ value, label }) => (
              <Link
                key={value}
                href={`/admin/mensajes${value ? `?status=${value}` : ''}`}
                className={cn(buttonVariants({ variant: status === value ? 'default' : 'ghost', size: 'sm' }))}
              >
                {label}
              </Link>
            ))}
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Remitente</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Asunto</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Fecha</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {!result?.data.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">Sin mensajes</td>
                </tr>
              ) : (
                result.data.map((msg) => <MessageRow key={msg.id} msg={msg} />)
              )}
            </tbody>
          </table>

          {result && result.totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Página {result.page} de {result.totalPages}</p>
              <div className="flex gap-2">
                {result.page > 1 && (
                  <Link
                    href={`?page=${result.page - 1}${status ? `&status=${status}` : ''}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Anterior
                  </Link>
                )}
                {result.page < result.totalPages && (
                  <Link
                    href={`?page=${result.page + 1}${status ? `&status=${status}` : ''}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    Siguiente
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
