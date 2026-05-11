// Configuración central del Hot Sale - usada en /hot-sale, /carrito, homepage, etc.
export const HOT_SALE_PRODUCTS = [
  "2f991d1f-e029-43ba-99d7-7b13c9978268", // Vitamina C unidosis
  "145f341a-b4e9-42a2-a632-f192aeb70e50", // Glisodin
  "42b9eee4-a910-465e-80f1-2565df0b3e2d", // Espuma de Limpieza
  "ca982517-4dca-4cc6-8169-51d931c71ea4", // Serum Hyaluronic
  "ea7f8feb-b226-432f-9693-871d0ff838b9", // Serum Redensity
] as const

export const HOT_SALE_DISCOUNT = 0.15 // 15% OFF
export const HOT_SALE_START = new Date(2026, 4, 11) // 11 May 2026
export const HOT_SALE_END   = new Date(2026, 4, 14) // 14 May 2026

export type HotSaleStatus = 'preview' | 'live' | 'ended'

export function getHotSaleStatus(now: Date = new Date()): HotSaleStatus {
  if (now >= HOT_SALE_END) return 'ended'
  if (now >= HOT_SALE_START) return 'live'
  return 'preview'
}

export function isHotSaleProduct(productId: string): boolean {
  return (HOT_SALE_PRODUCTS as readonly string[]).includes(productId)
}

// Devuelve el precio con descuento si el producto está en hot sale Y el hot sale está activo.
// Si no, devuelve el precio normal.
export function getEffectivePrice(product: { id: string, price: number }, now: Date = new Date()): number {
  if (getHotSaleStatus(now) === 'live' && isHotSaleProduct(product.id)) {
    return Math.round(product.price * (1 - HOT_SALE_DISCOUNT))
  }
  return product.price
}

// Devuelve info útil para mostrar precios en UI:
// - active: si aplica descuento
// - original: precio base
// - final: precio a cobrar
// - discountPct: porcentaje de descuento (solo si active)
export function getPriceInfo(product: { id: string, price: number }, now: Date = new Date()) {
  const active = getHotSaleStatus(now) === 'live' && isHotSaleProduct(product.id)
  const original = product.price
  const final = active ? Math.round(original * (1 - HOT_SALE_DISCOUNT)) : original
  return { active, original, final, discountPct: active ? Math.round(HOT_SALE_DISCOUNT * 100) : 0 }
}
