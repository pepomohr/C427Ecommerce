"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import { Lock, CreditCard, Loader2 } from "lucide-react"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Shipping info
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login?redirect=/checkout")
      return
    }

    setUser(user)

    // Load profile data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (profile?.full_name) {
      setFullName(profile.full_name)
    }

    setIsLoading(false)
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      // Create order in database
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shipping: {
            full_name: fullName,
            phone,
            address,
            city,
            postal_code: postalCode,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Error al crear la orden")
      }

      const { orderId, preferenceId } = await response.json()

      // Redirect to Mercado Pago
      if (preferenceId) {
        // In production, redirect to Mercado Pago checkout
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`
      } else {
        // For demo purposes, simulate successful payment
        await fetch("/api/checkout/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            paymentId: "demo_payment_" + Date.now(),
          }),
        })

        clearCart()
        router.push(`/checkout/exito?order=${orderId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago")
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    router.push("/carrito")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={!!user} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Finalizar Compra</h1>

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Envío</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre Completo *</Label>
                        <Input
                          id="fullName"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Juan Pérez"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+54 11 1234-5678"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Av. Corrientes 1234"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Buenos Aires"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Código Postal *</Label>
                        <Input
                          id="postalCode"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="C1043"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <CardTitle>Método de Pago</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <p className="font-semibold">Mercado Pago</p>
                        <p className="text-sm text-muted-foreground">Pago seguro con tarjeta o efectivo</p>
                      </div>
                      <div className="text-right">
                        <Image
                          src="/mercado-pago-logo.png"
                          alt="Mercado Pago"
                          width={100}
                          height={30}
                          className="opacity-70"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={item.product.image_url || "/placeholder.svg?height=100&width=100"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                            <p className="text-sm font-semibold">
                              ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">${totalPrice.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío</span>
                        <span className="font-medium">Gratis</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-xl" style={{ color: "oklch(0.35 0.08 160)" }}>
                        ${totalPrice.toLocaleString("es-AR")}
                      </span>
                    </div>

                    {error && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pagar con Mercado Pago
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                      Al confirmar tu compra, aceptas nuestros términos y condiciones
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
