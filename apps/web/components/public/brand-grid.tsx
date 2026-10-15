import Link from 'next/link'
import Image from 'next/image'
import { BRANDS } from '@/lib/brands'

export function BrandGrid() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {BRANDS.map((b) => (
        <li key={b.name}>
          <Link
            href={`/marcas/${b.slug}`}
            className="group flex h-28 flex-col items-center justify-center gap-1.5 rounded-xl border bg-white px-4 text-center transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            title={`Productos ${b.name}`}
          >
            {b.logo ? (
              <Image
                src={b.logo.src}
                alt={b.name}
                width={b.logo.width}
                height={b.logo.height}
                className="h-11 w-auto max-w-[130px] object-contain"
              />
            ) : (
              <span className="text-xl font-black uppercase italic tracking-tight text-slate-800 group-hover:text-primary">
                {b.name}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">{b.tagline}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
