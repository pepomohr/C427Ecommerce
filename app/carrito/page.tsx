"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/lib/cart-context"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          <div className="container px-4 md:px-6 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Carrito de Compras</h1>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
                <p className="text-muted-foreground mb-6 text-center leading-relaxed">
                  Agrega productos para comenzar tu compra
                </p>
                <Button asChild>
                  <Link href="/productos">Ver Productos</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold">Carrito de Compras</h1>
            <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive">
              Vaciar carrito
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.product.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link href={`/productos/${item.product.id}`} className="flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={item.product.image_url || "/placeholder.svg?height=200&width=200"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/productos/${item.product.id}`}>
                          <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-2">{item.product.category}</p>
                        <p className="font-bold" style={{ color: "oklch(0.35 0.08 160)" }}>
                          ${item.product.price.toLocaleString("es-AR")}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, Number.parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-sm font-semibold">
                          ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="font-serif text-2xl font-bold mb-6">Resumen del Pedido</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${totalPrice.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="font-medium">A calcular</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-xl" style={{ color: "oklch(0.35 0.08 160)" }}>
                        ${totalPrice.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Proceder al Pago</Link>
                  </Button>

                  <Button asChild variant="outline" className="w-full mt-3 bg-transparent">
                    <Link href="/productos">Seguir Comprando</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
