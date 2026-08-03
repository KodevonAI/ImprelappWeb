'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { useSidebar } from './sidebar-context'

interface AdminHeaderProps {
  title: string
  action?: React.ReactNode
}

export function AdminHeader({ title, action }: AdminHeaderProps) {
  const router = useRouter()
  const { toggle } = useSidebar()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 gap-2">
      <div className="flex items-center gap-1 min-w-0">
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="font-semibold text-base truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
