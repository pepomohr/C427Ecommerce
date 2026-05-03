"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Flame, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useToast } from "@/components/ui/use-toast"

const HOT_SALE_PRODUCTS = [
  "9cabe14f-8894-4ec5-b841-4c06b8e96493", // Gift Card General
  "2f991d1f-e029-43ba-99d7-7b13c9978268", // Vitamina C unidosis
]

const DESCUENTO = 0.15

// Precio mínimo para Gift Cards (precio variable, no viene de DB)
const GIFT_CARD_MIN_PRICE = 50000
const GIFT_CARD_ID = "9cabe14f-8894-4ec5-b841-4c06b8e96493"

function getHotSaleStatus(): 'preview' | 'live' | 'ended' {
  const now = new Date()
  const start = new Date(2026, 4, 11)
  const end   = new Date(2026, 4, 14)
  if (now >= end) return 'ended'
  if (now >= start) return 'live'
  return 'preview'
}

export default function HotSalePage() {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'preview' | 'live' | 'ended'>('preview')

  useEffect(() => {
    setStatus(getHotSaleStatus())
    async function load() {
      try {
        const results = await Promise.all(
          HOT_SALE_PRODUCTS.map(id => fetch(`/api/products?id=${id}`).then(r => r.json()))
        )
        setProducts(results.filter(p => p && !p.error))
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAdd = (product: any) => {
    addItem(product, 1)
    toast({ title: "¡Agregado!", description: `${product.nombre_web || product.name} en tu carrito.` })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">

        {/* Back */}
        <div className="mb-6">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link>
          </Button>
        </div>

        {/* Header promo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Flame className="h-4 w-4" /> Hot Sale
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
            {status === 'live' ? '¡Está activo!' : status === 'ended' ? 'Hot Sale finalizado' : 'Se viene el Hot Sale'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {status === 'live'
              ? '15% OFF en estos productos — solo hasta el 13 de Mayo.'
              : status === 'ended'
              ? 'El Hot Sale ya terminó. Seguí explorando nuestro catálogo.'
              : 'Del 11 al 13 de Mayo · 15% OFF en productos seleccionados.'}
          </p>
        </div>

        {/* Countdown or ended */}
        {status === 'ended' && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">¿Te lo perdiste? No te pierdas el próximo.</p>
            <Button asChild><Link href="/productos">Ver catálogo completo</Link></Button>
          </div>
        )}

        {/* Productos */}
        {status !== 'ended' && (
          <div className="flex flex-col gap-5">
            {loading ? (
              <p className="text-center py-16 text-muted-foreground animate-pulse">Cargando ofertas...</p>
            ) : products.map(prod => {
              const isGiftCard = prod.id === GIFT_CARD_ID
              const precioBase = isGiftCard ? GIFT_CARD_MIN_PRICE : (prod.price ?? 0)
              const precioDesc = Math.round(precioBase * (1 - DESCUENTO))
              const nombre = prod.nombre_web || prod.name
              const prefijo = isGiftCard ? 'Desde ' : ''
              return (
                <div key={prod.id} className="flex items-center gap-5 border border-border rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                  {prod.image_url && (
                    <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-muted/30">
                      <Image src={prod.image_url} alt={nombre} fill className="object-contain p-2" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="font-bold text-base leading-tight text-foreground">{nombre}</p>
                      {status === 'live' && (
                        <Badge className="bg-primary text-white text-[10px] font-bold shrink-0">15% OFF</Badge>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      {status === 'live' ? (
                        <>
                          <span className="text-2xl font-extrabold text-primary">{prefijo}${precioDesc.toLocaleString('es-AR')}</span>
                          <span className="text-sm text-muted-foreground line-through">{prefijo}${precioBase.toLocaleString('es-AR')}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-foreground">{prefijo}${precioBase.toLocaleString('es-AR')}</span>
                      )}
                    </div>
                    {status === 'preview' && (
                      <p className="text-xs text-muted-foreground mt-1">El descuento se aplica a partir del 11/05</p>
                    )}
                    {isGiftCard && status === 'live' && (
                      <p className="text-xs text-muted-foreground mt-1">Escribinos por WhatsApp para coordinar</p>
                    )}
                  </div>
                  {status === 'live' && !isGiftCard && (
                    <Button size="sm" onClick={() => handleAdd(prod)} className="shrink-0 gap-1.5">
                      <ShoppingCart className="h-4 w-4" /> Agregar
                    </Button>
                  )}
                  {status === 'live' && isGiftCard && (
                    <Button size="sm" asChild className="shrink-0 gap-1.5 bg-green-600 hover:bg-green-700">
                      <a href="https://wa.me/5491160352289?text=Hola!%20quiero%20comprar%20una%20Gift%20Card%20con%20el%20descuento%20del%20Hot%20Sale%20🔥" target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
