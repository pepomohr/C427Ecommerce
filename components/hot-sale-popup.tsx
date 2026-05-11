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
    if (sessionStorage.getItem(SESSION_KEY)) return
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-[380px] w-full overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-white/95 hover:bg-white shadow-md flex items-center justify-center text-foreground/70 hover:text-foreground transition-all"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header dorado con patrón */}
        <div className="relative px-8 pt-10 pb-8 bg-gradient-to-br from-[#a07853] via-[#936c43] to-[#7a5832] text-white text-center overflow-hidden">
          {/* Patrón decorativo de fondo */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-white blur-3xl" />
          </div>

          {/* Contenido */}
          <div className="relative">
            {/* Badge flama */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full mb-5 border border-white/20">
              <Flame className="h-3.5 w-3.5 text-orange-300 fill-orange-300" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase">Hot Sale</span>
            </div>

            <h2 className="text-5xl font-black tracking-tight leading-none mb-3 drop-shadow-sm">
              ¡ES HOY!
            </h2>

            <div className="inline-block bg-white text-[#7a5832] px-4 py-1.5 rounded-full font-black text-sm tracking-wide shadow-sm mb-3">
              15% OFF
            </div>

            <p className="text-sm font-medium opacity-95 leading-snug">
              En productos seleccionados
            </p>
            <p className="text-[11px] uppercase tracking-widest mt-2 opacity-75 font-bold">
              Solo hasta el 13 de Mayo
            </p>
          </div>
        </div>

        {/* Cuerpo blanco */}
        <div className="px-8 py-7 flex flex-col items-center gap-5 bg-white">
          <Image
            src="/c427logodorado.png"
            alt="C427 Medicina Estética"
            width={120}
            height={45}
            className="object-contain opacity-90"
          />

          <Link
            href="/hot-sale"
            onClick={handleClose}
            className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-white font-bold text-sm tracking-[0.15em] uppercase py-3.5 rounded-full hover:bg-foreground/90 transition-all hover:gap-3 shadow-sm"
          >
            Ver ofertas
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            onClick={handleClose}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            Seguir explorando
          </button>
        </div>
      </div>
    </div>
  )
}
