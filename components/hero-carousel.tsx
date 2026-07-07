"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  )
  const [hotSaleStatus, setHotSaleStatus] = React.useState<'preview' | 'live' | 'ended'>('preview')
  React.useEffect(() => {
    const now = new Date()
    const start = new Date(2026, 5, 30, 0, 0, 0)  // 30 Junio 2026 00:00 (martes)
    const end   = new Date(2026, 6, 6, 0, 0, 0)   // 6 Julio 2026 00:00 (todo el domingo 5 entra)
    if (now >= end) setHotSaleStatus('ended')
    else if (now >= start) setHotSaleStatus('live')
  }, [])

  const handleOpenChat = () => {
    window.dispatchEvent(new Event('openAuraChat'));
  };

  return (
    <Carousel
      plugins={[plugin.current as any]}
      className="w-full relative"
      opts={{ loop: true }}
    >
      <CarouselContent>
        {/* SLIDE 1: PROMO RELÁMPAGO 50% OFF (30 junio al 5 julio) */}
        {hotSaleStatus !== 'ended' && (
        <CarouselItem>
          <section className="relative overflow-hidden min-h-[380px] md:h-[550px] flex items-end md:items-center pb-10 md:pb-0">
            <Image
              src="/ofertas_celu.png"
              alt="50% OFF en toda la web · C427"
              fill
              className="object-cover object-center md:hidden"
              priority
            />
            <Image
              src="/ofertas.png"
              alt="50% OFF en toda la web · C427"
              fill
              className="object-cover object-center hidden md:block"
              priority
            />
            <div className="absolute inset-0 bg-black/65" />
            <div className="container relative z-10 pl-6 pr-4 md:px-6">
              <div className="max-w-xl text-left text-white">
                {hotSaleStatus === 'live' ? (
                  <>
                    <p className="text-xs md:text-base font-black tracking-widest uppercase mb-1 drop-shadow" style={{ color: '#f5c14a' }}>🔥 Oferta única</p>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-2 uppercase leading-none drop-shadow-lg">
                      50% OFF<br/>EN TODA LA WEB
                    </h1>
                    <p className="text-sm md:text-xl mb-5 md:mb-8 leading-relaxed font-medium drop-shadow-md max-w-[300px] md:max-w-md">
                      Aprovechá esta oferta única. <b>Solo hasta el domingo 23:59.</b> Gift cards incluidas.
                    </p>
                    <Button asChild className="text-[10px] md:text-sm h-8 md:h-12 px-4 md:px-8 rounded-md shadow-xl text-white border-none tracking-widest font-black uppercase hover:opacity-95" style={{ background: 'linear-gradient(90deg, #7a1220 0%, #b8860b 50%, #7a1220 100%)' }}>
                      <Link href="/productos">APROVECHAR AHORA &gt;</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs md:text-base font-black tracking-widest uppercase mb-1 drop-shadow" style={{ color: '#f5c14a' }}>🔥 Se viene</p>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-2 uppercase leading-none drop-shadow-lg">
                      50% OFF<br/>EN TODA LA WEB
                    </h1>
                    <p className="text-sm md:text-xl mb-5 md:mb-8 leading-relaxed font-medium drop-shadow-md max-w-[300px] md:max-w-md">
                      Oferta relámpago del martes 30 al domingo 5 de julio. Todo incluido — hasta las gift cards.
                    </p>
                    <Button asChild className="text-[10px] md:text-sm h-8 md:h-12 px-4 md:px-8 rounded-md shadow-xl text-white border-none tracking-widest font-black uppercase hover:opacity-95" style={{ background: 'linear-gradient(90deg, #7a1220 0%, #b8860b 50%, #7a1220 100%)' }}>
                      <Link href="/productos">VER PRODUCTOS &gt;</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </section>
        </CarouselItem>
        )}

        {/* SLIDE 2: AGENTE IA */}
        <CarouselItem>
          <section className="relative overflow-hidden min-h-[380px] md:h-[550px] flex items-end md:items-center pb-10 md:pb-0 transition-all duration-500">
            <Image
              src="/asesor_ia.png"
              alt="Asesor de inteligencia artificial de C427 - Consultá tu rutina de skincare personalizada"
              fill
              className="object-cover object-right"
            />

            <div className="absolute inset-0 bg-black/40 md:bg-black/50" />

            <div className="container relative z-10 pl-6 pr-4 md:px-6 text-white">
              <div className="max-w-xl text-left">
                <h1 className="text-2xl md:text-6xl font-bold tracking-tighter mb-2 uppercase leading-tight drop-shadow-lg">
                  CONSULTÁ CON NUESTRO AGENTE IA
                </h1>
                <p className="text-sm md:text-xl mb-5 md:mb-8 leading-relaxed font-light drop-shadow-md max-w-[250px] md:max-w-md">
                  Armá tu rutina ideal con nuestro asesor experto.
                </p>
                <div className="flex gap-3 justify-start">
                  <Button 
                    className="text-[10px] md:text-sm h-8 md:h-12 px-4 md:px-8 rounded-md shadow-xl bg-primary text-white border-none tracking-widest font-bold uppercase hover:bg-primary/90"
                    onClick={handleOpenChat}
                  >
                    CONSULTAR AHORA
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </CarouselItem>
      </CarouselContent>
      
      <div className="hidden md:block">
        <CarouselPrevious className="left-4 bg-white/20 text-white border-none" />
        <CarouselNext className="right-4 bg-white/20 text-white border-none" />
      </div>
    </Carousel>
  )
}