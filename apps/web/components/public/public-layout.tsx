import { Navbar } from './navbar'
import { Footer } from './footer'
import { getCategories } from '@/lib/data/public'

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  const all = await getCategories()
  const roots = all.filter((c) => !c.parentId).map((c) => ({ name: c.name, slug: c.slug }))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar categoryLinks={roots.slice(0, 6)} />
      <main className="flex-1">{children}</main>
      <Footer categoryLinks={roots} />
    </div>
  )
}
