// Configuración central de la PROMO relámpago - 50% OFF EN TODA LA WEB (gift cards incluidas)
// Del martes 30 de junio 2026 al domingo 5 de julio 2026 a las 23:59.
// Los precios se computan en runtime, así si la promo termina los carritos vuelven al precio normal.

export const HOT_SALE_DISCOUNT = 0.50 // 50% OFF
export const HOT_SALE_START = new Date(2026, 5, 30, 0, 0, 0)   // 30 Junio 2026 00:00 (martes)
export const HOT_SALE_END   = new Date(2026, 6, 6, 0, 0, 0)    // 6 Julio 2026 00:00 (todo el domingo 5 entra)

export type HotSaleStatus = 'preview' | 'live' | 'ended'

export function getHotSaleStatus(now: Date = new Date()): HotSaleStatus {
  if (now >= HOT_SALE_END) return 'ended'
  if (now >= HOT_SALE_START) return 'live'
  return 'preview'
}

// En esta promo TODO entra, incluidas las gift cards.
export function isHotSaleProduct(_product: { name?: string | null } | string): boolean {
  return true
}

// Devuelve el precio efectivo: con descuento si la promo está activa y el producto aplica.
export function getEffectivePrice(product: { name?: string | null, price: number }, now: Date = new Date()): number {
  if (getHotSaleStatus(now) === 'live' && isHotSaleProduct(product)) {
    return Math.round(product.price * (1 - HOT_SALE_DISCOUNT))
  }
  return product.price
}

// Devuelve info útil para mostrar precios en UI.
export function getPriceInfo(product: { id?: string, name?: string | null, price: number }, now: Date = new Date()) {
  const active = getHotSaleStatus(now) === 'live' && isHotSaleProduct(product)
  const original = product.price
  const final = active ? Math.round(original * (1 - HOT_SALE_DISCOUNT)) : original
  return { active, original, final, discountPct: active ? Math.round(HOT_SALE_DISCOUNT * 100) : 0 }
}
