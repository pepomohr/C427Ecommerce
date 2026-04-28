"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ArrowLeft, Package, Check } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const isGiftCard = product.name.toLowerCase().includes("gift card")
  
  const giftCardOptions = [
    { label: "Gift Card $50.000", price: 50000 },
    { label: "Gift Card $100.000", price: 100000 },
    { label: "Gift Card Antiage", price: 350000 },
  ]

  const [selectedOption, setSelectedOption] = useState(giftCardOptions[0])
  
  const currentPrice = isGiftCard ? selectedOption.price : product.price
  const currentProduct = isGiftCard ? { ...product, price: selectedOption.price, name: selectedOption.label } : product
  const isOutOfStock = product.stock === 0

  return (
    <div className="container px-4 md:px-6 py-4 md:py-6">
      {/* Botón Volver */}
      <Button variant="ghost" asChild className="mb-2 h-8 text-xs">
        <Link href="/productos">
          <ArrowLeft className="mr-2 h-3 w-3" />
          Volver
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 lg:gap-10 items-start">
        {/* Imagen del Producto */}
        <div className="flex justify-center lg:justify-start">
          <div className="relative aspect-square w-full max-w-[350px] md:max-w-[450px] overflow-hidden rounded-2xl bg-muted/30 border border-primary/5 shadow-sm">
            <Image
              src={product.image_url || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              fill
              className="object-contain p-4 md:p-8 transition-all duration-500"
              priority
            />
            {isOutOfStock && (
              <Badge variant="destructive" className="absolute top-3 right-3 text-xs px-2 py-0.5">
                Agotado
              </Badge>
            )}
          </div>
        </div>

        {/* Información del Producto */}
        <div className="flex flex-col space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2 uppercase tracking-widest text-[9px] font-bold py-0 h-5">
              {product.category}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight uppercase leading-tight">
              {isGiftCard ? selectedOption.label : product.name}
            </h1>
            
            <div className="flex items-baseline gap-3 mb-4 flex-wrap">
              <p className="text-3xl md:text-4xl font-bold text-primary tracking-tighter">
                ${currentPrice.toLocaleString("es-AR")}
              </p>
              {product.original_price && !isGiftCard && (
                <>
                  <p className="text-lg text-muted-foreground line-through font-normal">
                    ${product.original_price.toLocaleString("es-AR")}
                  </p>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    50% OFF
                  </span>
                </>
              )}
            </div>

            {isGiftCard && (
              <div className="mb-6 space-y-3">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Seleccionar Monto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {giftCardOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => setSelectedOption(option)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left ${
                        selectedOption.label === option.label
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 bg-white"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${selectedOption.label === option.label ? "text-primary" : "text-foreground"}`}>
                          {option.label.replace('Gift Card ', '')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">${option.price.toLocaleString("es-AR")}</span>
                      </div>
                      {selectedOption.label === option.label && <Check className="h-3 w-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <section>
                <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed text-sm font-light">
                  {product.description || "Sin descripción disponible"}
                </p>
              </section>

              <section>
                <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1">Modo de Uso</h2>
                <div className="bg-muted/40 p-3 rounded-lg border border-primary/5">
                  <p className="text-muted-foreground leading-relaxed text-sm font-light">
                    {product.usage_mode || "Consultar modo de uso con un profesional."}
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Package className="h-3 w-3 text-primary" />
              <span>
                <span className="font-bold text-primary">{product.stock}</span> unidades disponibles
              </span>
            </div>

            <AddToCartButton product={currentProduct} className="w-full h-12 text-sm font-bold tracking-widest uppercase rounded-md shadow-md hover:scale-[1.01] transition-transform" />
          </div>
        </div>
      </div>
    </div>
  )
}
