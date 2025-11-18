import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
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

  // Get statistics
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { data: orders } = await supabase.from("orders").select("total").eq("status", "paid")

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("*")
    .lte("stock", 10)
    .eq("is_active", true)
    .order("stock", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} isAdmin={true} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground mt-2">Gestiona productos, pedidos y ventas</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString("es-AR")}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockProducts?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/admin/productos">Gestionar Productos</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/productos/nuevo">Agregar Producto</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/pedidos">Ver Pedidos</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reportes</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/reportes">Ver Reportes</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Productos con Stock Bajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-destructive">Stock: {product.stock}</p>
                        <Button asChild variant="link" size="sm" className="h-auto p-0">
                          <Link href={`/admin/productos/${product.id}`}>Editar</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
