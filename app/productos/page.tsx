"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { Product } from "@/lib/types"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

// COMPONENTE INTERNO QUE USA SEARCHPARAMS
function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Sincronizamos los parámetros
  const tagParam = searchParams.get("tag")
  const categoryParam = searchParams.get("category")
  const qParam = searchParams.get("q")
  
  const selectedTag = tagParam || categoryParam || null
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const filterGroups = {
    CATEGORÍAS: ["facial", "corporal", "accesorios", "regalos"],
    "¿Qué buscás mejorar?": ["antiedad", "acne", "rosacea", "limpieza", "serums", "proteccion-solar", "contorno-de-ojos", "cuidado-intimo"],
    "Según tu piel": ["piel-seca", "piel-mixta", "piel-grasa", "piel-sensible"]
  }

  // Lista plana para el carrusel mobile
  const allTags = ["todos", ...Object.values(filterGroups).flat()]

  const formatTagName = (tag: string) => {
    return tag
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Acne', 'Acné')
      .replace('Rosacea', 'Rosácea')
      .replace('Serums', 'Sérums')
      .replace('Proteccion', 'Protección')
      .replace('Intimo', 'Íntimo')
  }

  const updateTagFilter = (tag: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tag) {
      params.set("tag", tag.toLowerCase())
      params.delete("category") // Usamos siempre TAG para ser consistentes con la DB
    } else {
      params.delete("tag")
      params.delete("category")
    }
    router.push(`/productos?${params.toString()}`, { scroll: false })
  }

  async function loadProducts() {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (selectedTag && selectedTag.toLowerCase() !== "todos") params.set("tag", selectedTag)
    if (qParam) params.set("q", qParam)

    const res  = await fetch(`/api/products?${params.toString()}`)
    const data = await res.json()

    if (Array.isArray(data)) {
      // Mapeamos los datos para que use 'nombre_web' si existe, si no usa el 'name' de siempre
      const mappedData = data.map((p: any) => ({
        ...p,
        name: p.nombre_web || p.name 
      }))
      setProducts(mappedData)
      setFilteredProducts(mappedData)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [selectedTag, qParam]) // Re-ejecuta cuando cambia el tag o la búsqueda

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-10">
        {/* Filtros Mobile (Carrusel Horizontal Infinito) */}
        <div className="md:hidden mb-8 -mx-4 px-4 sticky top-[72px] z-30 bg-white/95 backdrop-blur-sm py-3 border-b border-gray-100 shadow-sm">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {allTags.map((t) => (
                <CarouselItem key={t} className="pl-2 basis-auto">
                  <button
                    onClick={() => updateTagFilter(t === "todos" ? null : t)}
                    className={`whitespace-nowrap px-5 py-2 text-xs rounded-full border transition-all duration-300 font-bold uppercase tracking-widest ${
                      (!selectedTag && t === "todos") || selectedTag?.toLowerCase() === t.toLowerCase()
                        ? "bg-[#936c43] text-white border-[#936c43] shadow-md scale-105"
                        : "bg-white text-gray-500 border-gray-200 hover:border-primary/30"
                    }`}
                  >
                    {t === "todos" ? "Todos" : formatTagName(t)}
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar (Desktop Only) */}
          <aside className="hidden md:block w-64 space-y-8 sticky top-24 self-start h-[calc(100vh-140px)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 transition-colors">
             {Object.entries(filterGroups).map(([group, tags]) => (
                <div key={group}>
                  <h3 className="text-[10px] font-bold tracking-widest uppercase mb-4 border-b pb-2 text-primary/70">{group}</h3>
                  <div className="flex flex-col gap-1">
                    {group === "CATEGORÍAS" && (
                      <button 
                         onClick={() => updateTagFilter(null)}
                         className={`text-left px-3 py-2 text-xs rounded-md transition-all ${!selectedTag ? 'bg-[#936c43] text-white font-bold shadow-sm' : 'text-muted-foreground hover:bg-primary/5'}`}
                      >
                        Todos los Productos
                      </button>
                    )}
                    {tags.map(t => (
                      <button 
                         key={t}
                         onClick={() => updateTagFilter(t)}
                         className={`text-left px-3 py-2 text-xs rounded-md transition-all ${selectedTag?.toLowerCase() === t.toLowerCase() ? 'bg-[#936c43] text-white font-bold shadow-sm' : 'text-muted-foreground hover:bg-primary/5'}`}
                      >
                        {formatTagName(t)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </aside>

          {/* Grid de Productos */}
          <div className="flex-1">
             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
               {isLoading ? (
                 <p className="col-span-full text-center py-20 text-muted-foreground font-light tracking-widest animate-pulse">Cargando tratamientos premium...</p>
               ) : filteredProducts.length > 0 ? (
                 filteredProducts.map(p => (
                   <ProductCard key={p.id} product={p} />
                 ))
               ) : (
                 <div className="col-span-full text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-primary/20">
                    <p className="text-muted-foreground mb-4 font-light italic">No se encontraron productos en esta categoría.</p>
                    <Button onClick={() => updateTagFilter(null)} variant="outline" className="rounded-full px-8 uppercase text-[10px] tracking-widest font-bold border-primary/30 text-primary">Ver todo el catálogo</Button>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// EXPORTACIÓN PRINCIPAL CON SUSPENSE
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Cargando C427...</div>}>
      <ProductsContent />
    </Suspense>
  )
}