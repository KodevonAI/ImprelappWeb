export interface Brand {
  name: string
  /** URL segment for /marcas/[slug]. */
  slug: string
  /** Term passed to the catalog search (`/productos?search=`). */
  search: string
  /** Matches the brand inside a product name. */
  pattern: RegExp
  /** Official logo in /public/brands; brands without one render as a wordmark tile. */
  logo?: { src: string; width: number; height: number }
  /** Short line shown under the wordmark tile. */
  tagline: string
}

// Brands found in product names (catalog audit, Oct 2026). Order = display order.
// Logos only where an official/licensed file exists — see public/brands/CREDITS.md.
export const BRANDS: Brand[] = [
  { name: 'ZSG', slug: 'zsg', search: 'ZSG', pattern: /\bZ\s?S\s?G\b/i, tagline: 'Rodamientos y chumaceras' },
  { name: 'Starflex', slug: 'starflex', search: 'Starflex', pattern: /\bstarflex\b/i, tagline: 'Correas industriales' },
  {
    name: 'Koyo',
    slug: 'koyo',
    search: 'Koyo',
    pattern: /\bkoyo\b/i,
    logo: { src: '/brands/koyo.webp', width: 340, height: 160 },
    tagline: 'Rodamientos',
  },
  { name: 'Big Red', slug: 'big-red', search: 'Big Red', pattern: /\bbig red\b/i, tagline: 'Gatos y torres de bloqueo' },
  {
    name: 'INGCO',
    slug: 'ingco',
    search: 'Ingco',
    pattern: /\bingco\b/i,
    logo: { src: '/brands/ingco.webp', width: 306, height: 113 },
    tagline: 'Herramientas eléctricas',
  },
  {
    name: 'Norton',
    slug: 'norton',
    search: 'Norton',
    pattern: /\bnorton\b/i,
    logo: { src: '/brands/norton.webp', width: 562, height: 235 },
    tagline: 'Abrasivos y discos',
  },
  { name: 'Uduke', slug: 'uduke', search: 'Uduke', pattern: /\buduke\b/i, tagline: 'Llaves y herramienta manual' },
  { name: 'Chetak', slug: 'chetak', search: 'Chetak', pattern: /\bchetak\b/i, tagline: 'Lubricación y engrase' },
  { name: 'ToolCraft', slug: 'toolcraft', search: 'ToolCraft', pattern: /\btoolcraft\b/i, tagline: 'Mandriles y accesorios' },
  { name: 'Carprinpro', slug: 'carprinpro', search: 'Carprinpro', pattern: /\bcarprinpro\b/i, tagline: 'Lijas' },
  { name: 'VHarbor', slug: 'vharbor', search: 'VHarbor', pattern: /\bvharbor\b/i, tagline: 'Multitomas y extensiones' },
  { name: 'Globy', slug: 'globy', search: 'Globy', pattern: /\bgloby\b/i, tagline: 'Multitomas' },
  { name: 'KML', slug: 'kml', search: 'KML', pattern: /\bK\s?M\s?L\b/i, tagline: 'Rodamientos y chumaceras' },
  { name: 'LQB', slug: 'lqb', search: 'L Q B', pattern: /\bL\s?Q\s?B\b/i, tagline: 'Rodamientos cónicos' },
  { name: 'URB', slug: 'urb', search: 'U R B', pattern: /\bU\s?R\s?B\b/i, tagline: 'Rodamientos cónicos' },
  { name: 'SOR', slug: 'sor', search: 'SOR', pattern: /\bsor\b/i, tagline: 'Chumaceras' },
]

export function brandBySlug(slug: string): Brand | null {
  return BRANDS.find((b) => b.slug === slug) ?? null
}

export function detectBrand(productName: string): Brand | null {
  return BRANDS.find((b) => b.pattern.test(productName)) ?? null
}
