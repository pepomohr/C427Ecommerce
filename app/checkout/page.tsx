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
import { MessageCircle, Loader2, MapPin } from "lucide-react"
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

    if (profile?.full_name) {
      setFullName(profile.full_name)
    }

    setIsLoading(false)
  }

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    if (!fullName || !phone || !address || !city || !postalCode) {
        setError("Por favor, completa todos los campos de envío.");
        setIsProcessing(false);
        return;
    }

    try {
      const numeroC427 = "5491160352289";
      const mensajeBase = `*Nuevo Pedido - C427 Clínica Estética*\n\n`;
      
      const detalleProductos = items.map((item) => 
        `- ${item.product.name} (x${item.quantity}): $${(item.product.price * item.quantity).toLocaleString("es-AR")}`
      ).join('\n');

      const infoEnvio = `\n\n*Datos de Envío:*\n- Nombre: ${fullName}\n- Tel: ${phone}\n- Dirección: ${address}, ${city} (CP: ${postalCode})`;
      const total = `\n\n*Total a Pagar: $${totalPrice.toLocaleString("es-AR")}*`;
      
      const mensajeFinal = encodeURIComponent(mensajeBase + detalleProductos + infoEnvio + total);

      window.open(`https://wa.me/${numeroC427}?text=${mensajeFinal}`, '_blank');
      setIsProcessing(false);
      
    } catch (err) {
      setError("Error al generar el pedido por WhatsApp");
      setIsProcessing(false);
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
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header isAuthenticated={!!user} />

      <main className="flex-1">
        <div className="container px-2 sm:px-4 md:px-6 py-6 md:py-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 text-center md:text-left">Finalizar Compra</h1>

          <form onSubmit={handleCheckout}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Columna Izquierda: Formularios */}
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
                        <Label htmlFor="phone" className="text-sm">Teléfono de contacto *</Label>
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
                      <p className="font-semibold text-sm sm:text-base">Coordinar vía WhatsApp</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">Te contactaremos para coordinar el pago y el envío de tu compra.</p>
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

                    {error && <p className="text-xs text-destructive text-center bg-destructive/10 p-2 rounded">{error}</p>}
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-2 py-6" 
                      size="lg" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.004c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          Pedir por WhatsApp
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground">
                      Tu pedido se enviará por WhatsApp para coordinar el pago.
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