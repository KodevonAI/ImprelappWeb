import Link from 'next/link'
import Image from 'next/image'
import type { ProductListItemPublic } from '@imprelapp/types'
import { formatCOP } from '@/lib/format'
import { imageUrl } from '@/lib/seo'
import { detectBrand } from '@/lib/brands'
import { CategoryIcon, discountPercent } from '@/lib/category-ui'
import { QuickAddButton } from './quick-add-button'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: ProductListItemPublic
  /** Heading level for the product name; cards inside an h2 section use h3. */
  as?: 'h2' | 'h3'
  className?: string
  priority?: boolean
}

export function ProductCard({ product: p, as: Heading = 'h3', className, priority }: ProductCardProps) {
  const name = p.name.trim()
  const brand = detectBrand(name)
  const off = discountPercent(p.price, p.comparePrice)

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg',
        className
      )}
    >
      <Link href={`/productos/${p.slug}`} className="flex flex-1 flex-col" aria-label={name}>
        <div className="relative aspect-square bg-white">
          {p.image ? (
            <Image
              src={imageUrl(p.image)}
              alt={name}
              fill
              sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400">
              <CategoryIcon slug={p.categorySlug} className="size-10" strokeWidth={1.25} aria-hidden="true" />
              <span className="px-3 text-center text-[11px] font-medium uppercase tracking-wider">
                {brand?.name ?? p.categoryName ?? 'Imprelapp'}
              </span>
            </div>
          )}
          {off && (
            <span className="absolute left-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
              -{off}%
            </span>
          )}
          {!p.inStock && (
            <span className="absolute right-2 top-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
              Agotado
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {brand?.name ?? p.categoryName ?? ' '}
          </p>
          <Heading className="line-clamp-2 min-h-10 text-sm leading-5 text-foreground group-hover:text-primary">
            {name}
          </Heading>
          <div className="mt-auto pt-1">
            {off && p.comparePrice && (
              <p className="text-xs text-muted-foreground line-through">{formatCOP(p.comparePrice)}</p>
            )}
            <p className={cn('text-lg font-bold leading-6', off ? 'text-red-600' : 'text-foreground')}>
              {formatCOP(p.price)}
            </p>
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        {p.inStock ? (
          <QuickAddButton productId={p.id} name={name} slug={p.slug} price={p.price} />
        ) : (
          <span className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Sin stock
          </span>
        )}
      </div>
    </article>
  )
}
