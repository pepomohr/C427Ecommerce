import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, LogOut } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} isAdmin={profile?.role === "admin"} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">Mi Perfil</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium">{profile?.full_name || "Sin nombre"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Miembro desde</p>
                      <p className="font-medium">{new Date(user.created_at).toLocaleDateString("es-AR")}</p>
                    </div>
                  </div>
                  {profile?.role === "admin" && (
                    <div>
                      <Badge variant="secondary">Administrador</Badge>
                    </div>
                  )}
                  <form action="/auth/signout" method="post" className="pt-4">
                    <Button type="submit" variant="outline" className="w-full bg-transparent">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {profile?.role === "admin" && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Panel de Administración</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href="/admin">Ir al Dashboard</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
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
                                <span className="font-medium">
                                  ${(item.price * item.quantity).toLocaleString("es-AR")}
                                </span>
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
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No tienes pedidos aún</p>
                      <Button asChild>
                        <Link href="/productos">Comenzar a Comprar</Link>
                      </Button>
                    </div>
                  )}
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
