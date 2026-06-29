import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/sidebar'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: { default: 'Admin — Imprelapp', template: '%s — Admin Imprelapp' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
