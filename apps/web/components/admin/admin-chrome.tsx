'use client'

import { usePathname } from 'next/navigation'
import { SidebarProvider } from './sidebar-context'
import { AdminSidebar } from './sidebar'

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-muted/20">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>
      </div>
    </SidebarProvider>
  )
}
