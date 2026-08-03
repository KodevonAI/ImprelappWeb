import type { Metadata } from 'next'
import { AdminChrome } from '@/components/admin/admin-chrome'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: { default: 'Admin — Imprelapp', template: '%s — Admin Imprelapp' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminChrome>{children}</AdminChrome>
      <Toaster richColors position="top-right" />
    </>
  )
}
