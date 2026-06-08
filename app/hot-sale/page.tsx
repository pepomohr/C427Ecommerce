"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// La promo de junio 30% OFF aplica a TODA la web (excepto gift cards),
// así que ya no hay una selección especial. Redirigimos al catálogo completo.
export default function HotSalePage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/productos")
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <p className="text-lg font-bold uppercase tracking-widest text-primary mb-2">✨ 30% OFF en toda la web</p>
        <p className="text-sm text-muted-foreground">Redirigiendo al catálogo...</p>
      </div>
    </div>
  )
}
