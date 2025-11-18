import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email), order_items(*, product:products(*))")
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} isAdmin={true} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al dashboard
            </Link>
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-8">Gestión de Pedidos</h1>

          <Card>
            <CardHeader>
              <CardTitle>Todos los Pedidos ({orders?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Cliente: {order.profiles?.full_name || order.profiles?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString("es-AR")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            order.status === "paid"
                              ? "default"
                              : order.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {order.status === "paid"
                            ? "Pagado"
                            : order.status === "cancelled"
                              ? "Cancelado"
                              : "Pendiente"}
                        </Badge>
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
                      <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${order.total.toLocaleString("es-AR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No hay pedidos registrados</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
