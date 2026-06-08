// Configuración central de la PROMO de junio - usada en /carrito, homepage, product-card, etc.
// Campaña: 30% OFF en TODA la web (excepto gift cards), del 8 al 14 de junio 2026.
// Los precios se computan en runtime, así si la promo termina los carritos vuelven al precio normal.

export const HOT_SALE_DISCOUNT = 0.30 // 30% OFF
export const HOT_SALE_START = new Date(2026, 5, 8)   // 8 Junio 2026 (lunes)
export const HOT_SALE_END   = new Date(2026, 5, 15)  // 15 Junio 2026 (exclusivo - todo el 14 entra)

export type HotSaleStatus = 'preview' | 'live' | 'ended'

export function getHotSaleStatus(now: Date = new Date()): HotSaleStatus {
  if (now >= HOT_SALE_END) return 'ended'
  if (now >= HOT_SALE_START) return 'live'
  return 'preview'
}

// Detecta si un producto es una gift card por su nombre.
// Las gift cards NO entran en la promo.
function isGiftCard(product: { name?: string | null }): boolean {
  return (product.name || '').toLowerCase().includes('gift card')
}

// Decide si un producto entra a la promo.
// Aplica a todo MENOS gift cards.
export function isHotSaleProduct(product: { name?: string | null } | string): boolean {
  // Backwards compat: si se pasa solo un id (string), no podemos saber si es gift card → asumimos que aplica
  if (typeof product === 'string') return true
  if (isGiftCard(product)) return false
  return true
}

// Devuelve el precio efectivo: con descuento si la promo está activa y el producto aplica.
// Si no, devuelve el precio normal.
export function getEffectivePrice(product: { name?: string | null, price: number }, now: Date = new Date()): number {
  if (getHotSaleStatus(now) === 'live' && isHotSaleProduct(product)) {
    return Math.round(product.price * (1 - HOT_SALE_DISCOUNT))
  }
  return product.price
}

// Devuelve info útil para mostrar precios en UI:
// - active: si aplica descuento ahora
// - original: precio base (con strikethrough)
// - final: precio a cobrar (con descuento si corresponde)
// - discountPct: porcentaje de descuento (solo si active)
export function getPriceInfo(product: { id?: string, name?: string | null, price: number }, now: Date = new Date()) {
  const active = getHotSaleStatus(now) === 'live' && isHotSaleProduct(product)
  const original = product.price
  const final = active ? Math.round(original * (1 - HOT_SALE_DISCOUNT)) : original
  return { active, original, final, discountPct: active ? Math.round(HOT_SALE_DISCOUNT * 100) : 0 }
}
