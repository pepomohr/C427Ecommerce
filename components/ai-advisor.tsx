"use client"

import { useCart } from "@/lib/cart-context"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export function AIAdvisor() {
  const { items } = useCart()
  const [suggestion, setSuggestion] = useState<string | null>(null)
  
  useEffect(() => {
    if (items.length === 0) {
      setSuggestion(null)
      return
    }
    
    // Simplistic analysis based on keywords in product names or tags
    const hasSerum = items.some(i => i.product.name.toLowerCase().includes('sérum') || i.product.name.toLowerCase().includes('serum'))
    const hasCrema = items.some(i => i.product.name.toLowerCase().includes('crema'))
    const hasLimpieza = items.some(i => 
      i.product.name.toLowerCase().includes('limpieza') || 
      i.product.name.toLowerCase().includes('gel') || 
      i.product.tags?.some(t => t.toLowerCase() === 'facial' || t.toLowerCase() === 'limpieza')
    )

    if (hasSerum) {
      setSuggestion("Para potenciar el efecto hidratante de este Sérum, te recomendamos complementar con un tratamiento de Peeling renovador.")
    } else if (hasCrema) {
      setSuggestion("Toda Crema Premium penetra mejor luego de una Limpieza Facial Profunda. ¡Agendá la tuya!")
    } else if (hasLimpieza) {
      setSuggestion("Prepará tu piel con tu rutina de Limpieza y sellá los resultados con nuestros tratamientos revitalizantes en clínica.")
    } else {
      setSuggestion("¿Sabías que un Diagnóstico Personalizado puede ayudarte a sacar el máximo provecho de tu compra?")
    }
  }, [items])

  if (!suggestion || items.length === 0) return null

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
      <div className="bg-primary/10 p-2.5 rounded-full text-primary shrink-0 mt-0.5">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <h4 className="font-bold text-primary text-lg mb-1">Consultor C427</h4>
        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{suggestion}</p>
        <Link href="/diagnostico" className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center group">
          Agendar ahora <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
