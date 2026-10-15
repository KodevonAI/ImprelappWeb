import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// Server-side fetch: prefer the internal API URL (same as lib/public-api.ts).
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
// The API caps pageSize at 50, so the product list has to be paginated.
const PAGE_SIZE = 50

export const revalidate = 3600

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

type ProductPage = { data: Array<{ slug: string; updatedAt?: string }>; totalPages: number }

async function fetchAllProducts() {
  const first = await fetchJson<ProductPage>(`/api/products?pageSize=${PAGE_SIZE}&page=1`)
  if (!first) return []
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) =>
      fetchJson<ProductPage>(`/api/products?pageSize=${PAGE_SIZE}&page=${i + 2}`)
    )
  )
  return [first, ...rest].flatMap((p) => p?.data ?? [])
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    fetchJson<Array<{ slug: string; updatedAt?: string }>>('/api/categories/flat'),
    fetchAllProducts(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/productos`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/categorias/${c.slug}`,
    ...(c.updatedAt ? { lastModified: new Date(c.updatedAt) } : {}),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const seen = new Set<string>()
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => !seen.has(p.slug) && seen.add(p.slug))
    .map((p) => ({
      url: `${SITE_URL}/productos/${p.slug}`,
      ...(p.updatedAt ? { lastModified: new Date(p.updatedAt) } : {}),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
