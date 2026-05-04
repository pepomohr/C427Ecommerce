"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/add-to-cart-button"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const displayName = product.nombre_web || product.name
  const isOutOfStock = product.stock === 0
  const isGiftCard = displayName.toLowerCase().includes("gift card")
  const isVideo = product.image_url?.toLowerCase().endsWith('.mp4') || product.image_url?.toLowerCase().endsWith('.webm')
  
  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-xl transition-all duration-300 rounded-2xl border-border/50 hover:-translate-y-1">
      <Link href={`/productos/${product.id}`}>
        <div className="relative aspect-[4/3] md:aspect-square overflow-hidden bg-muted/20 flex items-center justify-center">
          <div className="relative w-full h-full p-4">
            {isVideo ? (
              <video
                src={product.image_url!}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <Image
                src={product.image_url || "/placeholder.svg?height=400&width=400"}
                alt={displayName}
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-105 p-2"
              />
            )}
          </div>
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-3 right-3 shadow-sm rounded-full px-3">
              Agotado
            </Badge>
          )}
          {product.tags?.some(t => t.toLowerCase() === 'promo') && (
            <Badge className="absolute top-3 left-0 shadow-md rounded-r-md rounded-l-none px-4 py-1.5 font-bold tracking-widest text-[11px] bg-primary text-white uppercase">
              PROMO
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-col flex-1 p-3 sm:p-6">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-bold text-base sm:text-xl mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 tracking-tight uppercase">
            {displayName}
          </h3>
        </Link>
        <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-1 mb-2 sm:mb-4 leading-relaxed font-light tracking-wide">
          {product.description}
        </p>
        <div className="flex items-end gap-2 sm:gap-3 mt-auto flex-wrap">
          {isGiftCard ? (
            <>
              <p className="text-lg sm:text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors tracking-tighter">
                Desde $50.000
              </p>
              <Badge className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                Elegí tu monto
              </Badge>
            </>
          ) : (
            <>
              <p className="text-lg sm:text-2xl font-bold text-primary group-hover:text-primary/80 transition-colors tracking-tighter">
                ${(product.price ?? 0).toLocaleString("es-AR")}
              </p>
              {product.original_price && (
                <>
                  <p className="text-sm sm:text-base text-muted-foreground line-through font-normal">
                    ${(product.original_price ?? 0).toLocaleString("es-AR")}
                  </p>
                  <Badge className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    50% OFF
                  </Badge>
                </>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-6 pt-0">
        <AddToCartButton
          product={product}
          className="w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors h-9 sm:h-10 text-[10px] sm:text-sm font-sans font-bold tracking-widest uppercase"
        />
      </CardFooter>
    </Card>
  )
}
