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
        {/* SLIDE 1: OFERTAS DE ABRIL */}
        <CarouselItem>
          <section className="relative overflow-hidden min-h-[380px] md:h-[550px] flex items-end md:items-center pb-10 md:pb-0">
            
            {/* Foto vertical para CELU */}
            <Image
              src="/ofertas_celu.png"
              alt="Ofertas de Abril - 10% off en transferencia en toda la web - C427 Medicina Estética"
              fill
              className="object-cover object-center md:hidden"
              priority
            />
            {/* Foto panorámica para DESKTOP */}
            <Image
              src="/ofertas.png"
              alt="Ofertas de Abril - 10% off en transferencia en toda la web - C427 Medicina Estética"
              fill
              className="object-cover object-center hidden md:block"
              priority
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/45" />

            <div className="container relative z-10 pl-6 pr-4 md:px-6">
              <div className="max-w-xl text-left text-white">
                <h1 className="text-2xl md:text-6xl font-bold tracking-tighter mb-2 uppercase leading-tight drop-shadow-lg">
                  OFERTAS DE ABRIL
                </h1>
                <p className="text-sm md:text-xl mb-5 md:mb-8 leading-relaxed font-light drop-shadow-md max-w-[250px] md:max-w-md">
                  10% off en transferencia en toda la web.
                </p>
                <div className="flex gap-3 justify-start">
                  <Button asChild className="text-[10px] md:text-sm h-8 md:h-12 px-4 md:px-8 rounded-md shadow-xl bg-primary text-white border-none tracking-widest font-bold uppercase hover:bg-primary/90">
                    <Link href="/productos">COMPRAR AHORA &gt;</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </CarouselItem>

        {/* SLIDE 2: AGENTE IA */}
        <CarouselItem>
          <section className="relative overflow-hidden min-h-[380px] md:h-[550px] flex items-end md:items-center pb-10 md:pb-0 transition-all duration-500">
            <Image
              src="/asesor_ia.png"
              alt="Asesor de inteligencia artificial de C427 - Consultá tu rutina de skincare personalizada"
              fill
              className="object-cover object-center md:object-right"
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