export interface Brand {
  name: string
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
  { name: 'ZSG', search: 'ZSG', pattern: /\bZ\s?S\s?G\b/i, tagline: 'Rodamientos y chumaceras' },
  { name: 'Starflex', search: 'Starflex', pattern: /\bstarflex\b/i, tagline: 'Correas industriales' },
  {
    name: 'Koyo',
    search: 'Koyo',
    pattern: /\bkoyo\b/i,
    logo: { src: '/brands/koyo.webp', width: 340, height: 160 },
    tagline: 'Rodamientos',
  },
  { name: 'Big Red', search: 'Big Red', pattern: /\bbig red\b/i, tagline: 'Gatos y torres de bloqueo' },
  {
    name: 'INGCO',
    search: 'Ingco',
    pattern: /\bingco\b/i,
    logo: { src: '/brands/ingco.webp', width: 306, height: 113 },
    tagline: 'Herramientas eléctricas',
  },
  {
    name: 'Norton',
    search: 'Norton',
    pattern: /\bnorton\b/i,
    logo: { src: '/brands/norton.webp', width: 562, height: 235 },
    tagline: 'Abrasivos y discos',
  },
  { name: 'Uduke', search: 'Uduke', pattern: /\buduke\b/i, tagline: 'Llaves y herramienta manual' },
  { name: 'Chetak', search: 'Chetak', pattern: /\bchetak\b/i, tagline: 'Lubricación y engrase' },
  { name: 'ToolCraft', search: 'ToolCraft', pattern: /\btoolcraft\b/i, tagline: 'Mandriles y accesorios' },
  { name: 'Carprinpro', search: 'Carprinpro', pattern: /\bcarprinpro\b/i, tagline: 'Lijas' },
  { name: 'VHarbor', search: 'VHarbor', pattern: /\bvharbor\b/i, tagline: 'Multitomas y extensiones' },
  { name: 'Globy', search: 'Globy', pattern: /\bgloby\b/i, tagline: 'Multitomas' },
  { name: 'KML', search: 'KML', pattern: /\bkml\b/i, tagline: 'Rodamientos y chumaceras' },
  { name: 'SOR', search: 'SOR', pattern: /\bsor\b/i, tagline: 'Chumaceras' },
]

export function detectBrand(productName: string): Brand | null {
  return BRANDS.find((b) => b.pattern.test(productName)) ?? null
}
