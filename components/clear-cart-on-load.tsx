"use client"

import { useEffect } from "react"
import { useCart } from "@/lib/cart-context"

export function ClearCartOnLoad() {
  const { clearCart } = useCart()
  useEffect(() => {
    clearCart()
  }, [])
  return null
}
