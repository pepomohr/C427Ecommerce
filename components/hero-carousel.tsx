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
    const start = new Date(2026, 4, 11)
    const end   = new Date(2026, 4, 14)
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
        {/* SLIDE 1: HOT SALE (reemplaza el 50% OFF) */}
        {hotSaleStatus !== 'ended' && (
        <CarouselItem>
          <section className="relative overflow-hidden min-h-[380px] md:h-[550px] flex items-end md:items-center pb-10 md:pb-0">
            <Image
              src="/ofertas_celu.png"
              alt="Hot Sale C427"
              fill
              className="object-cover object-center md:hidden"
              priority
            />
            <Image
              src="/ofertas.png"
              alt="Hot Sale C427"
              fill
              className="object-cover object-center hidden md:block"
              priority
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="container relative z-10 pl-6 pr-4 md:px-6">
              <div className="max-w-xl text-left text-white">
                {hotSaleStatus === 'live' ? (
                  <>
                    <p className="text-xs md:text-base font-bold tracking-widest uppercase text-primary mb-1 drop-shadow">🔥 Hot Sale</p>
                    <h1 className="text-3xl md:text-6xl font-bold tracking-tighter mb-2 uppercase leading-tight drop-shadow-lg">
                      ¡HOY ES EL DÍA!
                    </h1>
                    <p className="text-sm md:text-xl mb-5 md:mb-8 leading-relaxed font-light drop-shadow-md max-w-[250px] md:max-w-md">
                      Descuentos exclusivos del 11 al 13 de Mayo.
                    </p>
                    <Button asChild className="text-[10px] md:text-sm h-8 md:h-12 px-4 md:px-8 rounded-md shadow-xl bg-primary text-white border-none tracking-widest font-bold uppercase hover:bg-primary/90">
                      <Link href="/hot-sale">VER OFERTAS &gt;</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs md:text-base font-bold tracking-widest uppercase text-primary mb-1 drop-shadow">🔥 Se viene</p>
                    <h1 className="text-3xl md:text-6xl font-bold tracking-tighter mb-2 uppercase leading-tight drop-shadow-lg">
                      HOT SALE
                    </h1>
                    <p className="text-sm md:text-xl mb-5 md:mb-8 leading-relaxed font-light drop-shadow-md max-w-[250px] md:max-w-md">
                      11, 12 y 13 de Mayo — Descuentos exclusivos por tiempo limitado.
                    </p>
                    <Button asChild className="text-[10px] md:text-sm h-8 md:h-12 px-4 md:px-8 rounded-md shadow-xl bg-primary text-white border-none tracking-widest font-bold uppercase hover:bg-primary/90">
                      <Link href="/hot-sale">VER PREVIEW &gt;</Link>
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