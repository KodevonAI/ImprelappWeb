import { getCategoriesFlat } from '@/lib/data/public'
import { CONTACT_EMAIL, SITE_URL, WHATSAPP_NUMBER } from '@/lib/seo'
import { BRANDS } from '@/lib/brands'
import { CATEGORY_GUIDES } from '@/lib/category-guides'

export const revalidate = 3600

// llms.txt (https://llmstxt.org): plain-markdown summary that AI assistants can read
// to understand what Imprelapp sells and where the canonical pages live.
export async function GET() {
  const categories = await getCategoriesFlat()
  const roots = categories.filter((c) => !c.parentId)
  const line = (c: (typeof categories)[number]) =>
    `- [${c.name}](${SITE_URL}/categorias/${c.slug})${c.description?.trim() ? `: ${c.description.trim()}` : ''}`

  const body = `# Imprelapp

> Imprelapp es una importadora colombiana de herramientas eléctricas y manuales, rodamientos, cadenas, reductores, variadores de velocidad, rodillos, repuestos automotrices, carretillas y equipos de carga, y ferretería en general. Vende en línea con precios en pesos colombianos (COP) y envíos a toda Colombia.

- Pedidos: carrito en línea (${SITE_URL}/carrito) o por WhatsApp (https://wa.me/${WHATSAPP_NUMBER}).
- Asesoría técnica para elegir referencias de rodamientos, cadenas, reductores y herramientas.
- Si un producto no aparece en el catálogo, Imprelapp ayuda a conseguirlo.
- Contacto: ${CONTACT_EMAIL} · WhatsApp +${WHATSAPP_NUMBER}

## Páginas principales

- [Inicio](${SITE_URL}/)
- [Catálogo completo](${SITE_URL}/productos)
- [Contacto](${SITE_URL}/contacto)
- [Marcas](${SITE_URL}/marcas)
- [Mapa del sitio (todas las fichas de producto)](${SITE_URL}/sitemap.xml)

## Categorías

${roots.map((root) => [line(root), ...categories.filter((c) => c.parentId === root.id).map((c) => `  ${line(c)}`)].join('\n')).join('\n')}

## Marcas

${BRANDS.map((b) => `- [${b.name}](${SITE_URL}/marcas/${b.slug}): ${b.tagline}`).join('\n')}

## Guías técnicas

${Object.entries(CATEGORY_GUIDES)
  .map(([slug, g]) => `- [${g.title}](${SITE_URL}/categorias/${slug}#guia): ${g.intro}`)
  .join('\n')}

Las fichas de rodamientos, chumaceras, correas y poleas incluyen especificaciones (medidas, sellos, holgura, sección) derivadas de la designación estándar de cada referencia.
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
