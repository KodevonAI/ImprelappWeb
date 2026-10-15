import {
  Car,
  CircleDot,
  Cog,
  Cylinder,
  Drill,
  Forklift,
  Gauge,
  Hammer,
  Link as LinkIcon,
  Package,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import { createElement } from 'react'

const ICONS: Record<string, LucideIcon> = {
  'herramientas-electricas': Drill,
  'herramientas-manuales': Wrench,
  rodamientos: CircleDot,
  cadenas: LinkIcon,
  reductores: Cog,
  'variadores-de-velocidad': Gauge,
  rodillos: Cylinder,
  'repuestos-automotrices': Car,
  'carretillas-y-equipos': Forklift,
  'ferreteria-en-general': Hammer,
}

export function CategoryIcon({ slug, ...props }: LucideProps & { slug: string | null | undefined }) {
  return createElement((slug && ICONS[slug]) || Package, props)
}

/** Whole-number discount percentage, or null when there is no real markdown. */
export function discountPercent(price: string, comparePrice: string | null): number | null {
  const now = Number(price)
  const before = Number(comparePrice)
  if (!comparePrice || !(before > now) || !(now > 0)) return null
  const pct = Math.round((1 - now / before) * 100)
  return pct >= 1 ? pct : null
}
