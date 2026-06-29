'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  action?: React.ReactNode
}

export function AdminHeader({ title, action }: AdminHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <h1 className="font-semibold text-base">{title}</h1>
      <div className="flex items-center gap-2">
        {action}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
