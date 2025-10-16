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
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
    </Button>
  )
}
