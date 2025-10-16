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
  const isOutOfStock = product.stock === 0

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <Link href={`/productos/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <div className="relative w-full h-77 overflow-hidden">
  <Image
    src={product.image_url || "/placeholder.svg?height=400&width=400"}
    alt={product.name}
    fill
    className="object-contain transition-transform group-hover:scale-105"
  />
</div>
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Agotado
            </Badge>
          )}
          {product.category && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              {product.category}
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
        <p className="text-2xl font-bold" style={{ color: "oklch(0.35 0.08 160)" }}>
          ${product.price.toLocaleString("es-AR")}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <AddToCartButton product={product} className="w-full" />
      </CardFooter>
    </Card>
  )
}
