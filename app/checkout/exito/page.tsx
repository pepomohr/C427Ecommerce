import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClearCartOnLoad } from "@/components/clear-cart-on-load"
import { WhatsAppRedirect } from "@/components/whatsapp-redirect"
import Link from "next/link"
import { CheckCircle, Package, MessageCircle } from "lucide-react"

async function SuccessContent({ searchParams }: { searchParams: Promise<{ order?: string; method?: string; wa?: string }> }) {
  const params = await searchParams
  const isWhatsapp = params.method === "whatsapp"
  const waUrl = params.wa ? decodeURIComponent(params.wa) : null
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  let order = null
  if (params.order) {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(*))")
      .eq("id", params.order)
      .eq("user_id", user.id)
      .single()
    order = data
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Limpia el carrito cuando el pago fue exitoso */}
      <ClearCartOnLoad />
      <Header isAuthenticated={true} isAdmin={profile?.role === "admin"} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full ${isWhatsapp ? "bg-green-100" : "bg-primary/10"}`}>
                    {isWhatsapp
                      ? <MessageCircle className="h-12 w-12 text-[#25D366]" />
                      : <CheckCircle className="h-12 w-12 text-primary" />
                    }
                  </div>
                </div>
                <CardTitle className="text-3xl text-center">
                  {isWhatsapp ? "¡Pedido Enviado!" : "¡Compra Exitosa!"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground leading-relaxed">
                  {isWhatsapp
                    ? "Tu pedido fue enviado por WhatsApp. En breve te respondemos con el alias para realizar la transferencia y confirmamos el envío."
                    : "Tu pedido ha sido procesado correctamente. Recibirás un email de confirmación con los detalles de tu compra."
                  }
                </p>

                {order && (
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-5 w-5" />
                      <span className="font-semibold">Pedido #{order.id.slice(0, 8)}</span>
                    </div>

                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.product?.name} x{item.quantity}
                          </span>
                          <span className="font-medium">${(item.price * item.quantity).toLocaleString("es-AR")}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-xl" style={{ color: "oklch(0.35 0.08 160)" }}>
                        ${order.total.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                )}

                <div className={`rounded-lg p-4 ${isWhatsapp ? "bg-green-50 border border-green-100" : "bg-muted/30"}`}>
                  <h3 className="font-semibold mb-2">¿Qué sigue?</h3>
                  {isWhatsapp ? (
                    <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                      <li>• Revisá el WhatsApp que se abrió con tu pedido</li>
                      <li>• Te responderemos con el alias para transferir</li>
                      <li>• Una vez confirmado el pago, preparamos tu pedido</li>
                      <li>• Coordinamos el envío contigo por WhatsApp</li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                      <li>• Recibirás un email de confirmación</li>
                      <li>• Prepararemos tu pedido en 24-48 horas</li>
                      <li>• Te enviaremos el código de seguimiento</li>
                      <li>• Recibirás tu pedido en 3-5 días hábiles</li>
                    </ul>
                  )}
                </div>

                {isWhatsapp && waUrl && (
                  <WhatsAppRedirect url={waUrl} />
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1">
                    <Link href="/perfil">Ver Mis Pedidos</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 bg-transparent">
                    <Link href="/productos">Seguir Comprando</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string; method?: string }> }) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  )
}
