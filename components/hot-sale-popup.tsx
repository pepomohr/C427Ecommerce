"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Sparkles, ArrowRight } from "lucide-react"
import { getHotSaleStatus } from "@/lib/hot-sale"

const SESSION_KEY = "promo_junio_popup_seen"

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
        className="relative bg-white rounded-3xl shadow-2xl max-w-[400px] w-full overflow-hidden animate-in zoom-in-95 duration-300"
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

        {/* Header dorado con gradiente brilloso tipo oro pulido */}
        <div
          className="relative px-8 pt-10 pb-8 text-white text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #b8860b 0%, #c8a96a 35%, #e6c97d 50%, #c8a96a 65%, #8b6914 100%)',
          }}
        >
          {/* Patrón decorativo de fondo */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-white blur-3xl" />
          </div>

          {/* Contenido */}
          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-5 border border-white/30">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase">Promoción</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight leading-none mb-2 drop-shadow-sm uppercase">
              30% OFF
            </h2>
            <p className="text-sm font-bold tracking-wide opacity-95 mb-4">
              EN TODA LA WEB
            </p>

            <div className="inline-block bg-white text-[#8b6914] px-4 py-1.5 rounded-full font-black text-xs tracking-widest shadow-sm mb-3 uppercase">
              Hasta el domingo 14
            </div>

            <p className="text-[11px] uppercase tracking-widest mt-2 opacity-80 font-bold">
              Aprovechá esta semana
            </p>
          </div>
        </div>

        {/* Cuerpo blanco */}
        <div className="px-8 py-7 flex flex-col items-center gap-4 bg-white">
          <Image
            src="/c427logodorado.png"
            alt="C427 Medicina Estética"
            width={120}
            height={45}
            className="object-contain opacity-90"
          />

          <p className="text-xs text-center text-muted-foreground leading-relaxed">
            Tus productos favoritos con <b className="text-foreground">30% de descuento</b>.<br/>
            <span className="text-[11px] opacity-75">Aplica a toda la web · Gift cards no incluidas</span>
          </p>

          <Link
            href="/productos"
            onClick={handleClose}
            className="w-full inline-flex items-center justify-center gap-2 text-white font-bold text-sm tracking-[0.15em] uppercase py-3.5 rounded-full hover:opacity-90 transition-all hover:gap-3 shadow-md"
            style={{ background: 'linear-gradient(90deg, #b8860b, #c8a96a)' }}
          >
            Ver productos
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
