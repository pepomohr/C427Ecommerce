"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  className?: string
}

export function AddToCartButton({ product, quantity = 1, className }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    })
  }

  return (
    <Button className={className} onClick={handleAddToCart} disabled={isOutOfStock}>
      <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
      {isOutOfStock ? (
        <span className="ml-1">Sin stock</span>
      ) : (
        <>
          <span className="ml-1 sm:hidden">Agregar</span>
          <span className="ml-1.5 hidden sm:inline">Agregar al Carrito</span>
        </>
      )}
    </Button>
  )
}
