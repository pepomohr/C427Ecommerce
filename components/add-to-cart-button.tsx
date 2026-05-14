"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, RotateCcw } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  className?: string
}

export function AddToCartButton({ product, quantity = 1, className }: AddToCartButtonProps) {
  const { addItem, items, removeItem, updateQuantity } = useCart()
  const { toast } = useToast()
  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    // Guardar cantidad previa para poder revertir
    const prevQty = items.find(i => i.product.id === product.id)?.quantity ?? 0
    addItem(product, quantity)
    toast({
      title: "Producto agregado",
      description: `${product.nombre_web || product.name} se agregó al carrito`,
      duration: 5000,
      action: (
        <ToastAction
          altText="Deshacer"
          onClick={() => {
            if (prevQty === 0) {
              removeItem(product.id)
            } else {
              updateQuantity(product.id, prevQty)
            }
          }}
          className="font-bold gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Deshacer
        </ToastAction>
      ),
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
