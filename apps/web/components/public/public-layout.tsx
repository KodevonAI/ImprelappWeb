import { Navbar } from './navbar'
import { Footer } from './footer'
import { publicGet } from '@/lib/public-api'
import type { Category } from '@imprelapp/types'

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  let topCategories: Category[] = []
  try {
    const all = await publicGet<Category[]>('/api/categories')
    topCategories = all.filter((c) => !c.parentId).slice(0, 6)
  } catch {}

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar categoryLinks={topCategories.map((c) => ({ name: c.name, slug: c.slug }))} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
