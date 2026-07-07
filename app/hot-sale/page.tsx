"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Promo relámpago 50% OFF en TODA la web (gift cards incluidas). Redirigimos al catálogo.
export default function HotSalePage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/productos")
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <p className="text-lg font-black uppercase tracking-widest text-primary mb-2">🔥 50% OFF en toda la web</p>
        <p className="text-sm text-muted-foreground">Redirigiendo al catálogo...</p>
      </div>
    </div>
  )
}
