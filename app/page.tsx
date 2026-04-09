import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { HeroCarousel } from "@/components/hero-carousel"
import { Newsletter } from "@/components/newsletter"
import { createClient } from "@/lib/supabase/server"
import Testimonials from "@/components/testimonials"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

export default async function HomePage() {
  const supabase = await createClient()

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile if authenticated
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  // Get featured products (first 4 active products)
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .limit(4)

  // Get latest products (for Lanzamientos)
  const { data: latestProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <Header isAuthenticated={!!user} isAdmin={profile?.role === "admin"} />

      <main className="flex-1">
        <HeroCarousel />



        {/* Novedades - Fondo Blanco */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-10 md:py-16 bg-white">
            <div className="container px-4 md:px-6">
              <div className="text-left mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-1 text-primary tracking-tight uppercase">NOVEDADES</h2>
                <div className="w-12 h-1 bg-primary/20 mb-2"></div>
                <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
                  Descubrí los últimos lanzamientos de nuestra clínica.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Ofertas del Mes - Carrusel en Celular / Grid en PC */}
        {latestProducts && latestProducts.length > 0 && (
          <section className="py-10 md:py-16 bg-muted">
            <div className="container px-4 md:px-6">
              <Carousel 
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <div className="flex justify-between items-end mb-6 md:mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight uppercase">OFERTAS DEL MES</h2>
                    <div className="w-12 h-1 bg-primary/20 mb-2"></div>
                    <p className="text-muted-foreground text-sm md:text-base">Aprovechá nuestros precios especiales</p>
                  </div>
                  {/* Desktop arrows beside the title */}
                  <div className="hidden md:flex gap-4">
                    <CarouselPrevious className="static translate-y-0 border-primary/20 text-primary hover:bg-primary hover:text-white" />
                    <CarouselNext className="static translate-y-0 border-primary/20 text-primary hover:bg-primary hover:text-white" />
                  </div>
                </div>
                
                <CarouselContent className="md:grid md:grid-cols-4 md:gap-8 md:ml-0">
                  {latestProducts.map((product) => (
                    <CarouselItem key={product.id} className="basis-full md:basis-auto md:p-0">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Mobile indicators/arrows centered below */}
                <div className="flex md:hidden justify-center gap-4 mt-8">
                  <CarouselPrevious className="static translate-y-0 border-primary/20 text-primary hover:bg-primary hover:text-white" />
                  <CarouselNext className="static translate-y-0 border-primary/20 text-primary hover:bg-primary hover:text-white" />
                </div>
              </Carousel>
            </div>
          </section>
        )}

        {/* Más Vendidos - Fondo Blanco */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-10 md:py-16 bg-white">
            <div className="container px-4 md:px-6">
              <div className="text-left mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-1 text-primary tracking-tight uppercase">MÁS VENDIDOS</h2>
                <div className="w-12 h-1 bg-primary/20 mb-2"></div>
                <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
                  Los favoritos de nuestra comunidad para resultados garantizados.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {featuredProducts.slice().reverse().map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sobre el Consultorio - Fondo Crema Hueso (Separador) */}
        <section className="py-12 md:py-16 bg-muted border-y border-primary/10">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className="relative aspect-video md:aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="/tu_momento.jpeg"
                  alt="Tratamiento Profesional C427"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/5 mix-blend-multiply"></div>
              </div>
              <div className="text-left space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold text-primary leading-tight tracking-tight">
                  TU MOMENTO DE <br /> BIENESTAR
                </h2>
                <div className="w-16 h-1 bg-primary/30"></div>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                  En <strong>C427</strong>, fusionamos la excelencia médica con la calidez personalizada. Nuestro consultorio es un espacio diseñado para tu renovación integral, donde cada tratamiento es aplicado con rigor científico y la última tecnología dermocosmética.
                </p>
                <Button asChild className="bg-primary text-white hover:bg-primary/90 px-6 py-5 text-base rounded-full transition-all hover:scale-105">
                  <Link href="/diagnostico">Diagnóstico</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <Testimonials
          userDisplayName={profile?.full_name || profile?.email || null}
          userId={user?.id || null}
        />

        <Newsletter />
      </main>

      <Footer />
    </div>
  )
}
