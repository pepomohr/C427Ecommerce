"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Flame, ArrowRight } from "lucide-react"
import { getHotSaleStatus } from "@/lib/hot-sale"

const SESSION_KEY = "hot_sale_popup_seen"

export function HotSalePopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (getHotSaleStatus() !== 'live') return
    // Solo mostrar si no fue cerrado en esta sesión
    if (sessionStorage.getItem(SESSION_KEY)) return
    // Pequeño delay para que no aparezca apenas carga
    const timer = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    sessionStorage.setItem(SESSION_KEY, "1")
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-foreground transition-all hover:scale-105"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header con fondo dorado/primario */}
        <div className="relative px-6 pt-10 pb-6 bg-gradient-to-br from-primary to-primary/80 text-white text-center">
          {/* Flama decorativa */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-orange-500 flex items-center justify-center shadow-lg ring-4 ring-white">
            <Flame className="h-7 w-7 text-white" />
          </div>

          <p className="text-[11px] font-bold tracking-[0.25em] uppercase opacity-90 mt-2 mb-2">
            Hot Sale
          </p>
          <h2 className="text-5xl font-black tracking-tight leading-none mb-3">
            ¡ES HOY!
          </h2>
          <p className="text-base font-medium opacity-95 leading-snug">
            15% OFF en productos seleccionados
          </p>
          <p className="text-xs opacity-80 mt-1">
            Solo hasta el 13 de Mayo
          </p>
        </div>

        {/* Logo C427 + CTA */}
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <Image
            src="/c427logodorado.png"
            alt="C427 Medicina Estética"
            width={130}
            height={50}
            className="object-contain"
          />

          <Link
            href="/hot-sale"
            onClick={handleClose}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-white font-bold text-sm tracking-wider uppercase py-3.5 rounded-xl hover:bg-foreground/90 transition-colors group"
          >
            Ver ofertas
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <button
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  )
}
