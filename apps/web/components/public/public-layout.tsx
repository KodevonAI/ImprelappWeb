import { Navbar } from './navbar'
import { Footer } from './footer'
import { getCategories } from '@/lib/data/public'

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  const all = await getCategories()
  const topCategories = all.filter((c) => !c.parentId).slice(0, 6)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar categoryLinks={topCategories.map((c) => ({ name: c.name, slug: c.slug }))} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
