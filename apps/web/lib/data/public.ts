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
  const result = await getProducts({ featured: true, pageSize: limit })
  return result.data
}

export async function getProductBySlug(slug: string): Promise<ProductPublic | null> {
  try {
    return await publicGet<ProductPublic>(`/api/products/${slug}`)
  } catch {
    return null
  }
}
