/**
 * Derives technical specs from standard designations in product names
 * (ISO bearing codes, UC housed units, classical V-belts, pulleys).
 * Only emits values that follow from the designation itself; unknown
 * codes produce no row rather than a guess.
 */

export interface SpecRow {
  label: string
  value: string
}

export interface ProductSpecs {
  kind: string
  rows: SpecRow[]
  /** One-line plain summary, used in meta descriptions and schema. */
  summary: string
  /** Short qualifier appended to the page title, e.g. "17x40x12 mm". */
  titleHint?: string
}

// d x D x B in mm — ISO 15 boundary dimensions.
const BEARING_DIMENSIONS: Record<string, [number, number, number]> = {
  // 60 series
  '6000': [10, 26, 8], '6001': [12, 28, 8], '6002': [15, 32, 9], '6003': [17, 35, 10], '6004': [20, 42, 12],
  '6005': [25, 47, 12], '6006': [30, 55, 13], '6007': [35, 62, 14], '6008': [40, 68, 15], '6009': [45, 75, 16],
  '6010': [50, 80, 16], '6011': [55, 90, 18], '6012': [60, 95, 18], '6013': [65, 100, 18], '6014': [70, 110, 20],
  '6015': [75, 115, 20], '6016': [80, 125, 22], '6017': [85, 130, 22], '6018': [90, 140, 24], '6019': [95, 145, 24],
  '6020': [100, 150, 24],
  // 62 series
  '6200': [10, 30, 9], '6201': [12, 32, 10], '6202': [15, 35, 11], '6203': [17, 40, 12], '6204': [20, 47, 14],
  '6205': [25, 52, 15], '6206': [30, 62, 16], '6207': [35, 72, 17], '6208': [40, 80, 18], '6209': [45, 85, 19],
  '6210': [50, 90, 20], '6211': [55, 100, 21], '6212': [60, 110, 22], '6213': [65, 120, 23], '6214': [70, 125, 24],
  '6215': [75, 130, 25], '6216': [80, 140, 26],
  // 63 series
  '6300': [10, 35, 11], '6301': [12, 37, 12], '6302': [15, 42, 13], '6303': [17, 47, 14], '6304': [20, 52, 15],
  '6305': [25, 62, 17], '6306': [30, 72, 19], '6307': [35, 80, 21], '6308': [40, 90, 23], '6309': [45, 100, 25],
  '6310': [50, 110, 27], '6311': [55, 120, 29], '6312': [60, 130, 31], '6313': [65, 140, 33], '6314': [70, 150, 35],
  '6315': [75, 160, 37],
  // 64 series
  '6403': [17, 62, 17], '6404': [20, 72, 19], '6405': [25, 80, 21], '6406': [30, 90, 23], '6407': [35, 100, 25],
  '6408': [40, 110, 27], '6409': [45, 120, 29], '6410': [50, 130, 31], '6411': [55, 140, 33],
  // Miniature
  '625': [5, 16, 5], '626': [6, 19, 6], '627': [7, 22, 7], '608': [8, 22, 7], '609': [9, 24, 7], '629': [9, 26, 8],
  '635': [5, 19, 6], '696': [6, 15, 5], '698': [8, 19, 6],
  // Intermediate bores (series/bore)
  '60/22': [22, 44, 12], '60/28': [28, 52, 12], '60/32': [32, 58, 13],
  '62/22': [22, 50, 14], '62/28': [28, 58, 16], '62/32': [32, 65, 17],
  '63/22': [22, 56, 16], '63/28': [28, 68, 18],
}

// Tapered roller bearings (T is total width).
const TAPERED_DIMENSIONS: Record<string, [number, number, number]> = {
  '30204': [20, 47, 15.25], '30205': [25, 52, 16.25], '30206': [30, 62, 17.25],
  '32004': [20, 42, 15], '32005': [25, 47, 15], '33205': [25, 52, 22],
}

// UC insert bearing bore by size code (metric).
const UC_BORE_MM: Record<string, number> = {
  '201': 12, '202': 15, '203': 17, '204': 20, '205': 25, '206': 30,
  '207': 35, '208': 40, '209': 45, '210': 50, '211': 55, '212': 60,
}

const HOUSINGS: Record<string, string> = {
  UCP: 'Puente (pillow block) de 2 pernos',
  UCF: 'Brida cuadrada de 4 pernos',
  UCFL: 'Brida ovalada de 2 pernos',
  UCFC: 'Brida redonda',
  UCT: 'Tensora (take-up)',
}

// Classical V-belt cross sections: top width x height in mm.
const BELT_SECTIONS: Record<string, [number, number]> = {
  A: [13, 8],
  B: [17, 11],
  C: [22, 14],
  D: [32, 19],
}

const mm = (n: number) => `${String(n).replace('.', ',')} mm`

function inchesLabel(sixteenths: number): string {
  const whole = Math.floor(sixteenths / 16)
  let num = sixteenths % 16
  let den = 16
  while (num && num % 2 === 0) {
    num /= 2
    den /= 2
  }
  const frac = num ? `${num}/${den}` : ''
  return `${whole ? whole : ''}${whole && frac ? '-' : ''}${frac}"`
}

/** Parses a bore written in the name after the designation: "13mm", "3/4", "1.1/4", "5/8". */
function nameBore(rest: string): string | null {
  const metric = rest.match(/\b(\d{1,3})\s?mm\b/i)
  if (metric) return `${metric[1]} mm`
  const inch = rest.match(/(?:^|\s)((?:\d\.)?\d\/\d{1,2})(?=\s|$)/)
  return inch ? `${inch[1].replace('.', '-')}"` : null
}

function bearingSpecs(name: string): ProductSpecs | null {
  const code = name.match(/\b(6[0-4]\d{2}|6[0-9]{2}|6[0-3]\/\d{2}|3[023]\d{3})(?:\s?X)?\b/)
  if (!code) return null
  const designation = code[1]
  const after = name.slice((code.index ?? 0) + code[0].length)
  const rows: SpecRow[] = []
  const tapered = TAPERED_DIMENSIONS[designation]
  const dims = tapered ?? BEARING_DIMENSIONS[designation]
  const kind = tapered ? 'Rodamiento de rodillos cónicos' : 'Rodamiento rígido de bolas'

  rows.push({ label: 'Tipo', value: kind })
  rows.push({ label: 'Referencia', value: designation + (tapered && /\b\d{5}\s?X\b/.test(name) ? 'X' : '') })

  const special = tapered ? null : nameBore(after)
  const specialBore = dims && special && special !== `${dims[0]} mm` ? special : null
  if (dims) {
    const [d, D, B] = dims
    rows.push({ label: 'Diámetro interior (d)', value: specialBore ? `${specialBore} (interior especial)` : mm(d) })
    rows.push({ label: 'Diámetro exterior (D)', value: mm(D) })
    rows.push({ label: tapered ? 'Ancho total (T)' : 'Ancho (B)', value: mm(B) })
  } else {
    const slash = designation.match(/^6[0-3]\/(\d{2})$/)
    if (slash) rows.push({ label: 'Diámetro interior (d)', value: `${slash[1]} mm` })
  }

  const seals = /\b2RS\d?\b/i.test(name)
    ? 'Sellado de caucho en ambos lados (2RS)'
    : /\b(ZZ|2Z)\b/i.test(name)
      ? 'Blindaje metálico en ambos lados (ZZ)'
      : /\bRS\b/i.test(name)
        ? 'Sellado de caucho en un lado (RS)'
        : /\b\d{3,4}\s+Z(NR)?\b/i.test(name)
          ? 'Blindaje metálico en un lado (Z)'
          : null
  if (seals) rows.push({ label: 'Protección', value: seals })
  if (/\bC3\b/.test(name)) rows.push({ label: 'Holgura interna', value: 'C3, mayor que la normal' })
  if (/\b(2?Z)?NR\b/.test(name)) rows.push({ label: 'Ranura', value: 'Ranura con anillo de retención (NR)' })

  const dimText = dims
    ? specialBore
      ? ` con interior especial de ${specialBore}, exterior ${dims[1]} mm y ancho ${dims[2]} mm`
      : ` de ${dims[0]} x ${dims[1]} x ${dims[2]} mm`.replace('.', ',')
    : ''
  const extras = [
    seals?.match(/\((\w+)\)/)?.[1],
    /\bC3\b/.test(name) ? 'C3' : null,
    /\b(2?Z)?NR\b/.test(name) ? 'NR' : null,
  ]
    .filter(Boolean)
    .join(', ')
  return {
    kind,
    rows,
    summary: `${kind} ${designation}${dimText}${extras ? ` (${extras})` : ''}.`,
    titleHint: dims && !specialBore ? `${dims[0]}x${dims[1]}x${dims[2]} mm`.replace('.', ',') : undefined,
  }
}

function housedUnitSpecs(name: string): ProductSpecs | null {
  const m = name.match(/\b(UCFL|UCFC|UCP|UCF|UCT)\s?(2\d{2})(?:\s?-\s?(\d{1,2}))?/i)
  if (!m) return null
  const housing = m[1].toUpperCase()
  const size = m[2]
  const rows: SpecRow[] = [
    { label: 'Tipo', value: 'Chumacera (unidad de rodamiento con soporte)' },
    { label: 'Soporte', value: `${housing}: ${HOUSINGS[housing]}` },
    { label: 'Inserto', value: `UC${size}${m[3] ? `-${m[3]}` : ''}` },
  ]
  let shaft: string | null = null
  if (m[3]) {
    const sixteenths = Number(m[3])
    shaft = `${inchesLabel(sixteenths)} (${String(Math.round(sixteenths * 158.75) / 100).replace('.', ',')} mm)`
  } else if (UC_BORE_MM[size]) {
    shaft = mm(UC_BORE_MM[size])
  }
  if (shaft) rows.push({ label: 'Diámetro de eje', value: shaft })
  rows.push({ label: 'Fijación al eje', value: 'Prisioneros (tornillos de fijación)' })
  return {
    kind: 'Chumacera',
    rows,
    summary: `Chumacera ${housing} ${size}${m[3] ? `-${m[3]}` : ''}, ${HOUSINGS[housing].toLowerCase()}${shaft ? `, para eje de ${shaft}` : ''}.`,
    titleHint: shaft ? `eje ${shaft.split(' (')[0]}` : undefined,
  }
}

function beltSpecs(name: string): ProductSpecs | null {
  if (!/\bcorrea\b/i.test(name) || /automotriz/i.test(name)) return null
  const m = name.match(/\b([ABCD])\s?(\d{2,3})(?:SH)?\b/)
  if (!m || !BELT_SECTIONS[m[1]]) return null
  const [top, height] = BELT_SECTIONS[m[1]]
  const inches = Number(m[2])
  const cm = (inches * 2.54).toFixed(1).replace('.', ',')
  return {
    kind: 'Correa en V',
    rows: [
      { label: 'Tipo', value: 'Correa en V clásica' },
      { label: 'Sección', value: `${m[1]} (${top} x ${height} mm aprox.)` },
      { label: 'Longitud nominal', value: `${inches}" (${cm} cm)` },
      { label: 'Referencia', value: `${m[1]}${inches}` },
    ],
    summary: `Correa en V sección ${m[1]}, referencia ${m[1]}${inches}, longitud nominal ${inches} pulgadas (${cm} cm).`,
    titleHint: `${m[1]}${inches}, ${cm} cm`,
  }
}

function pulleySpecs(name: string): ProductSpecs | null {
  const m = name.match(/\bpolea\s+(\d+(?:\s?\.\s?\d+)?)\s*x\s*(\d)\s*([AB])\b(?:.*?\beje\s+([\d./]+))?/i)
  if (!m) return null
  const diameter = m[1].replace(/\s/g, '').replace('.', ',')
  const grooves = Number(m[2])
  const rows: SpecRow[] = [
    { label: 'Tipo', value: 'Polea en V' },
    { label: 'Diámetro', value: `${diameter}"` },
    { label: 'Canales', value: `${grooves} canal${grooves > 1 ? 'es' : ''} tipo ${m[3].toUpperCase()}` },
  ]
  if (m[4]) rows.push({ label: 'Eje', value: `${m[4].replace('.', '-')}"` })
  return {
    kind: 'Polea',
    rows,
    summary: `Polea en V de ${diameter}" con ${grooves} canal${grooves > 1 ? 'es' : ''} tipo ${m[3].toUpperCase()}${m[4] ? `, eje de ${m[4].replace('.', '-')}"` : ''}.`,
  }
}

export function productSpecs(name: string, categorySlug?: string | null): ProductSpecs | null {
  const clean = name.replace(/\s+/g, ' ').trim()
  if (/^chumacera\b/i.test(clean) || /\bUC[PFT]/i.test(clean)) {
    const unit = housedUnitSpecs(clean)
    if (unit) return unit
  }
  if (/^rodamiento\b/i.test(clean) || categorySlug === 'rodamientos') {
    const bearing = bearingSpecs(clean)
    if (bearing) return bearing
  }
  return beltSpecs(clean) ?? pulleySpecs(clean)
}
