"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, Flame, Clock, ArrowRight } from "lucide-react"
import { getHotSaleStatus, HOT_SALE_END } from "@/lib/hot-sale"

const SESSION_KEY = "promo_50off_popup_seen_v1"

function useCountdown(target: Date) {
  const [now, setNow] = useState<Date>(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export function HotSalePopup() {
  const [open, setOpen] = useState(false)
  const { days, hours, minutes, seconds } = useCountdown(HOT_SALE_END)

  useEffect(() => {
    if (getHotSaleStatus() !== 'live') return
    if (sessionStorage.getItem(SESSION_KEY)) return
    const timer = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(timer)
  }, [])

  // Cuando el popup se abre/cierra, avisamos al botón flotante del chat
  // para que se oculte y no ensucie los screenshots de la promo.
  useEffect(() => {
    if (open) window.dispatchEvent(new Event('promoPopupOpen'))
    else window.dispatchEvent(new Event('promoPopupClose'))
  }, [open])

  const handleClose = () => {
    sessionStorage.setItem(SESSION_KEY, "1")
    setOpen(false)
  }

  if (!open) return null

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.5)] max-w-[420px] w-full overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-30 h-9 w-9 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center text-foreground/70 hover:text-foreground transition-all"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* HEADER con gradiente rojo/dorado dramático */}
        <div
          className="relative px-8 pt-9 pb-9 text-white text-center overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #7a1220 0%, #b8860b 30%, #f5c14a 55%, #b8860b 75%, #7a1220 100%)',
          }}
        >
          {/* Halos */}
          <div className="absolute inset-0 opacity-25 pointer-events-none">
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white blur-3xl" />
          </div>

          {/* Badge OFERTA ÚNICA */}
          <div className="relative inline-flex items-center gap-1.5 bg-white text-[#7a1220] px-3.5 py-1.5 rounded-full mb-4 shadow-lg animate-pulse">
            <Flame className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase">Oferta única</span>
          </div>

          {/* 50% OFF gigante */}
          <div className="relative flex items-baseline justify-center gap-1 mb-1">
            <span
              className="text-[88px] font-black tracking-tighter leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]"
              style={{ textShadow: '0 2px 0 rgba(0,0,0,0.15)' }}
            >
              50
            </span>
            <span className="text-4xl font-black leading-none drop-shadow-md">%</span>
            <span className="text-3xl font-black leading-none ml-1 drop-shadow-md">OFF</span>
          </div>

          <p className="relative text-base font-black tracking-widest opacity-95 uppercase mt-1">
            En toda la web
          </p>
          <p className="relative text-[11px] tracking-[0.2em] font-bold opacity-85 mt-1 uppercase">
            Gift cards incluidas
          </p>

          {/* COUNTDOWN */}
          <div className="relative mt-5 flex items-center justify-center gap-1.5 text-white">
            <Clock className="h-3.5 w-3.5 opacity-90" />
            <span className="text-[10px] uppercase tracking-widest opacity-90 font-bold">Termina en</span>
          </div>
          <div className="relative mt-2 flex items-center justify-center gap-1.5">
            {[
              { label: 'días', value: days },
              { label: 'hs', value: hours },
              { label: 'min', value: minutes },
              { label: 'seg', value: seconds },
            ].map((u, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2.5 py-1.5 min-w-[42px]">
                  <span className="text-lg font-black tabular-nums leading-none">{pad(u.value)}</span>
                </div>
                <span className="text-[9px] uppercase tracking-widest opacity-80 font-bold mt-1">{u.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CUERPO */}
        <div className="px-8 py-7 flex flex-col items-center gap-4 bg-white">
          <Image
            src="/c427logodorado.png"
            alt="C427 Medicina Estética"
            width={110}
            height={40}
            className="object-contain opacity-90"
          />

          <p className="text-sm text-center text-foreground leading-relaxed font-medium">
            <b className="text-[#7a1220]">Aprovechá esta oferta única.</b><br/>
            <span className="text-xs text-muted-foreground">
              Todos los productos, cremas, gift cards y más — al <b>50% de descuento</b> hasta el <b>domingo 23:59</b>.
            </span>
          </p>

          <Link
            href="/productos"
            onClick={handleClose}
            className="w-full inline-flex items-center justify-center gap-2 text-white font-black text-sm tracking-[0.15em] uppercase py-4 rounded-full hover:opacity-95 transition-all hover:gap-3 shadow-xl"
            style={{
              background: 'linear-gradient(90deg, #7a1220 0%, #b8860b 50%, #7a1220 100%)',
            }}
          >
            Aprovechar ahora
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
