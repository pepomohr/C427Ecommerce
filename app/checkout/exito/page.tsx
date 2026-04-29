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
import { CheckCircle, Package } from "lucide-react"

const WhatsAppSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#25D366" viewBox="0 0 16 16">
    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
  </svg>
)

async function SuccessContent({ searchParams }: { searchParams: Promise<{ order?: string; method?: string }> }) {
  const params = await searchParams
  const isWhatsapp = params.method === "whatsapp"
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
                      ? <WhatsAppSVG />
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

                {isWhatsapp && (
                  <WhatsAppRedirect />
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
