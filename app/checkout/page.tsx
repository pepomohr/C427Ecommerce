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
import { CardPaymentForm } from "@/components/card-payment-form"
import { Loader2, MapPin, CreditCard, AlertCircle, ExternalLink, MessageCircle } from "lucide-react"
import Image from "next/image"

type PaymentMethod = "card" | "mp" | "whatsapp"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")

  useEffect(() => {
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

  function validateShipping() {
    if (!fullName || !phone || !address || !city || !postalCode) {
      setError("Por favor completá todos los campos de envío.")
      return false
    }
    return true
  }

  async function handleWhatsAppCheckout() {
    setError(null)
    if (!validateShipping()) return
    setIsProcessing(true)

    try {
      const supabase = createClient()

      // Crear orden en DB con estado pendiente WhatsApp
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: totalPrice,
          status: "pending_whatsapp",
          shipping_address: { fullName, phone, address, city, postalCode },
          payer_email: user.email ?? "",
        })
        .select()
        .single()

      if (orderError || !order) throw new Error("Error al crear el pedido")

      await supabase.from("order_items").insert(
        items.map((item) => ({
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        }))
      )

      const pedidoId = order.id.slice(0, 8).toUpperCase()
      const productLines = items
        .map((i) => `• ${i.product.name} x${i.quantity} — $${(i.product.price * i.quantity).toLocaleString("es-AR")}`)
        .join("\n")

      const mensaje = encodeURIComponent(
        `Hola! 👋 Quiero hacer un pedido en *C427 Medicina Estética*\n\n` +
        `📦 *Productos:*\n${productLines}\n\n` +
        `💰 *Total: $${totalPrice.toLocaleString("es-AR")}*\n\n` +
        `👤 *Nombre:* ${fullName}\n` +
        `📞 *Tel:* ${phone}\n` +
        `📍 *Dirección:* ${address}, ${city} (${postalCode})\n\n` +
        `🆔 Pedido #${pedidoId}\n\n` +
        `Por favor confirmame el alias para realizar la transferencia 🙏`
      )

      clearCart()
      window.open(`https://wa.me/5491160352289?text=${mensaje}`, "_blank")
      router.push(`/checkout/exito?order=${order.id}&method=whatsapp`)

    } catch (err: any) {
      setError(err?.message || "Error al procesar el pedido. Intentá de nuevo.")
      setIsProcessing(false)
    }
  }

  async function handleMPCheckout() {
    setError(null)
    if (!validateShipping()) return

    setIsProcessing(true)
    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          email: user?.email ?? "",
          shipping: { fullName, phone, address, city, postalCode },
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.init_point) {
        setError(`${data.error ?? "Error al iniciar el pago"}${data.detail ? ` — ${data.detail}` : ""}`)
        setIsProcessing(false)
        return
      }

      // NO limpiar el carrito aquí: si el redirect falla en mobile, el carrito se pierde.
      // El carrito se limpia en la página de éxito (/checkout/exito).
      window.location.href = data.init_point

    } catch {
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

  const shipping = { fullName, phone, address, city, postalCode }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header isAuthenticated={!!user} />

      <main className="flex-1">
        <div className="container px-2 sm:px-4 md:px-6 py-6 md:py-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center md:text-left">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Columna Izquierda */}
            <div className="lg:col-span-2 space-y-6">

              {/* Datos de envío */}
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

              {/* Método de entrega */}
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

              {/* Selector de método de pago */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Método de Pago</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">

                  {/* Tabs */}
                  <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-2.5 px-2 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === "card"
                          ? "bg-white shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>💳</span>
                      <span>Tarjeta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mp")}
                      className={`py-2.5 px-2 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === "mp"
                          ? "bg-white shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Image src="/mercado-pago-logo.png" alt="MP" width={18} height={18} className="object-contain" />
                      <span>Mercado Pago</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("whatsapp")}
                      className={`py-2.5 px-2 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                        paymentMethod === "whatsapp"
                          ? "bg-white shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      <span>WhatsApp</span>
                    </button>
                  </div>

                  {/* Panel tarjeta */}
                  {paymentMethod === "card" && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Ingresá los datos de tu tarjeta. El pago se procesa de forma segura, nunca almacenamos tu información.
                      </p>
                      <CardPaymentForm
                        items={items}
                        shipping={shipping}
                        userId={user.id}
                        email={user.email ?? ""}
                        total={totalPrice}
                        onSuccess={(orderId) => {
                          clearCart()
                          router.push(`/checkout/exito?order=${orderId}`)
                        }}
                        onError={(msg) => setError(msg)}
                      />
                    </div>
                  )}

                  {/* Panel Mercado Pago */}
                  {paymentMethod === "mp" && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 border rounded-lg bg-blue-50/50 border-blue-200">
                        <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-blue-800">Pago externo con Mercado Pago</p>
                          <p className="text-xs text-blue-600 mt-1">
                            Serás redirigido a Mercado Pago para completar el pago. Podés usar saldo, QR, transferencia o tarjeta.
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="text-xs">{error}</p>
                        </div>
                      )}

                      <Button
                        type="button"
                        className="w-full py-6 font-bold"
                        disabled={isProcessing}
                        onClick={handleMPCheckout}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Procesando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Continuar con Mercado Pago →
                          </div>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Panel WhatsApp */}
                  {paymentMethod === "whatsapp" && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 border rounded-lg bg-green-50/50 border-green-200">
                        <MessageCircle className="h-4 w-4 text-[#25D366] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-green-800">Pago por transferencia / alias</p>
                          <p className="text-xs text-green-700 mt-1">
                            Al confirmar, se abrirá WhatsApp con los detalles de tu pedido. Te responderemos con el alias para realizar la transferencia y coordinar el envío.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg border text-xs text-muted-foreground space-y-1">
                        <p className="font-semibold text-foreground text-sm">¿Cómo funciona?</p>
                        <p>1. Hacés clic en "Terminar por WhatsApp"</p>
                        <p>2. Se abre WhatsApp con tu pedido completo</p>
                        <p>3. Te enviamos el alias para transferir</p>
                        <p>4. Confirmamos tu pago y coordinamos el envío</p>
                      </div>

                      {error && (
                        <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="text-xs">{error}</p>
                        </div>
                      )}

                      <Button
                        type="button"
                        className="w-full py-6 font-bold bg-[#25D366] hover:bg-[#20b558] text-white"
                        disabled={isProcessing}
                        onClick={handleWhatsAppCheckout}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Preparando pedido...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Terminar por WhatsApp
                          </div>
                        )}
                      </Button>
                    </div>
                  )}

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

                  <p className="text-[10px] text-center text-muted-foreground">
                    🔒 Pago 100% seguro. Nunca almacenamos datos de tu tarjeta.
                  </p>
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
