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
import { Loader2, MapPin, CreditCard, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")

  useEffect(() => {
    // Limpiar carrito si viene de un pago exitoso
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("error") === "pago_fallido") {
      setError("El pago no pudo procesarse. Intentá de nuevo.")
    }
    checkAuth()
  }, [])

  async function checkAuth() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login?redirect=/checkout")
      return
    }

    setUser(user)
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    if (profile?.full_name) setFullName(profile.full_name)

    setIsLoading(false)
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    if (!fullName || !phone || !address || !city || !postalCode) {
      setError("Por favor completá todos los campos de envío.")
      setIsProcessing(false)
      return
    }

    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: { fullName, phone, address, city, postalCode },
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.init_point) {
        setError(data.error ?? "Error al iniciar el pago. Intentá de nuevo.")
        setIsProcessing(false)
        return
      }

      // Limpiar carrito y redirigir a Mercado Pago
      clearCart()
      window.location.href = data.init_point

    } catch (err) {
      setError("Error de conexión. Verificá tu internet e intentá de nuevo.")
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

  if (items.length === 0 && !isLoading) {
    router.push("/carrito")
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header isAuthenticated={!!user} />

      <main className="flex-1">
        <div className="container px-2 sm:px-4 md:px-6 py-6 md:py-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center md:text-left">Finalizar Compra</h1>

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Columna Izquierda */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg">Información de Envío</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm">Nombre Completo *</Label>
                        <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Pérez" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm">Teléfono *</Label>
                        <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="11 1234-5678" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm">Dirección *</Label>
                      <Input id="address" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Corrientes 1234" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm">Ciudad *</Label>
                        <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Buenos Aires" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm">Código Postal *</Label>
                        <Input id="postalCode" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="C1425" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Método de Entrega</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="font-semibold text-sm sm:text-base">Envío a domicilio</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Te contactaremos para coordinar el envío una vez confirmado el pago.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Mercado Pago */}
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-blue-800">Pago seguro con Mercado Pago</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Podés pagar con tarjeta de crédito, débito o transferencia bancaria. Serás redirigido a Mercado Pago para completar el pago.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Columna Derecha: Resumen */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20 border-primary/20 shadow-lg">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="relative w-14 h-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <Image
                              src={item.product.image_url || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                            <p className="text-sm font-semibold mt-1">
                              ${(item.product.price * item.quantity).toLocaleString("es-AR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${totalPrice.toLocaleString("es-AR")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío</span>
                        <span className="text-green-600 font-medium">Gratis</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center py-2">
                      <span className="font-bold text-base">Total</span>
                      <span className="font-bold text-xl" style={{ color: "#936c43" }}>
                        ${totalPrice.toLocaleString("es-AR")}
                      </span>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="text-xs">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full py-6 text-sm font-bold tracking-wide"
                      size="lg"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Procesando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Image
                            src="/mercado-pago-logo.png"
                            alt="Mercado Pago"
                            width={24}
                            height={24}
                            className="object-contain brightness-0 invert"
                          />
                          Pagar con Mercado Pago
                        </div>
                      )}
                    </Button>

                    <p className="text-[10px] text-center text-muted-foreground">
                      Pago 100% seguro. Podés pagar con tarjeta, débito o transferencia.
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
