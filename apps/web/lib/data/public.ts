import 'server-only'
import { publicGet } from '@/lib/public-api'
import type { CategoryPublic, ProductListItemPublic, ProductPublic, PaginatedResponse } from '@imprelapp/types'

interface ProductListParams {
  search?: string
  categoryId?: number
  page?: number
  pageSize?: number
  featured?: boolean
}

function buildProductParams(params: ProductListParams) {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 24),
  })
  if (params.search) qs.set('search', params.search)
  if (params.categoryId) qs.set('categoryId', String(params.categoryId))
  if (params.featured) qs.set('featured', 'true')
  return qs
}

export async function getCategories(): Promise<CategoryPublic[]> {
  try {
    return await publicGet<CategoryPublic[]>('/api/categories')
  } catch {
    return []
  }
}

export async function getCategoriesFlat(): Promise<CategoryPublic[]> {
  try {
    return await publicGet<CategoryPublic[]>('/api/categories/flat')
  } catch {
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryPublic | null> {
  const flat = await getCategoriesFlat()
  return flat.find((c) => c.slug === slug) ?? null
}

export async function getProducts(
  params: ProductListParams = {}
): Promise<PaginatedResponse<ProductListItemPublic>> {
  try {
    return await publicGet<PaginatedResponse<ProductListItemPublic>>(`/api/products?${buildProductParams(params)}`)
  } catch {
    return { data: [], total: 0, page: 1, pageSize: params.pageSize ?? 24, totalPages: 0 }
  }
}

export async function getFeaturedProducts(limit = 8): Promise<ProductListItemPublic[]> {
  const featured = await getProducts({ featured: true, pageSize: limit })
  if (featured.data.length > 0) return featured.data

  const fallback = await getProducts({ pageSize: limit * 3 })
  return shuffle(fallback.data).slice(0, limit)
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function getProductBySlug(slug: string): Promise<ProductPublic | null> {
  try {
    return await publicGet<ProductPublic>(`/api/products/${slug}`)
  } catch {
    return null
  }
}

const ALL_PAGE_SIZE = 50 // API maximum

/** Whole public catalog (paginated under the hood). Used by brand pages. */
export async function getAllProducts(): Promise<ProductListItemPublic[]> {
  const first = await getProducts({ pageSize: ALL_PAGE_SIZE, page: 1 })
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPages - 1) }, (_, i) =>
      getProducts({ pageSize: ALL_PAGE_SIZE, page: i + 2 })
    )
  )
  return [first, ...rest].flatMap((r) => r.data)
}
