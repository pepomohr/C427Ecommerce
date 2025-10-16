import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, DollarSign, Package, Calendar } from "lucide-react"
import Link from "next/link"

export default async function AdminReportsPage() {
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

  // Get current month dates
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Monthly sales
  const { data: monthlySales } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("status", "paid")
    .gte("created_at", firstDayOfMonth.toISOString())
    .lte("created_at", lastDayOfMonth.toISOString())

  const monthlyRevenue = monthlySales?.reduce((sum, order) => sum + Number(order.total), 0) || 0
  const monthlyOrderCount = monthlySales?.length || 0

  // Total sales (all time)
  const { data: allSales } = await supabase.from("orders").select("total").eq("status", "paid")

  const totalRevenue = allSales?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  // Monthly expenses
  const { data: monthlyExpenses } = await supabase
    .from("expenses")
    .select("amount")
    .gte("created_at", firstDayOfMonth.toISOString())
    .lte("created_at", lastDayOfMonth.toISOString())

  const totalMonthlyExpenses = monthlyExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0

  // Product sales ranking
  const { data: productSales } = await supabase
    .from("order_items")
    .select("product_id, quantity, price, product:products(name, category)")
    .order("quantity", { ascending: false })

  // Aggregate product sales
  const productSalesMap = new Map()
  productSales?.forEach((item: any) => {
    const existing = productSalesMap.get(item.product_id)
    if (existing) {
      existing.quantity += item.quantity
      existing.revenue += item.price * item.quantity
    } else {
      productSalesMap.set(item.product_id, {
        name: item.product?.name || "Producto eliminado",
        category: item.product?.category,
        quantity: item.quantity,
        revenue: item.price * item.quantity,
      })
    }
  })

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  // Recent expenses
  const { data: recentExpenses } = await supabase
    .from("expenses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const monthName = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" })

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

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">Reportes y Análisis</h1>
              <p className="text-muted-foreground mt-2">Visualiza el rendimiento de tu negocio</p>
            </div>
            <Button asChild>
              <Link href="/admin/reportes/gastos">Gestionar Gastos</Link>
            </Button>
          </div>

          {/* Monthly Overview */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString("es-AR")}</div>
                  <p className="text-xs text-muted-foreground mt-1">{monthlyOrderCount} pedidos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalMonthlyExpenses.toLocaleString("es-AR")}</div>
                  <p className="text-xs text-muted-foreground mt-1">{monthlyExpenses?.length || 0} registros</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(monthlyRevenue - totalMonthlyExpenses).toLocaleString("es-AR")}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthlyRevenue > 0
                      ? `${(((monthlyRevenue - totalMonthlyExpenses) / monthlyRevenue) * 100).toFixed(1)}% margen`
                      : "Sin ventas"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* All Time Stats */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Estadísticas Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ingresos Totales</p>
                  <p className="text-3xl font-bold" style={{ color: "oklch(0.35 0.08 160)" }}>
                    ${totalRevenue.toLocaleString("es-AR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Pedidos</p>
                  <p className="text-3xl font-bold">{allSales?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{product.quantity} vendidos</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${product.revenue.toLocaleString("es-AR")}</p>
                          <p className="text-xs text-muted-foreground">ingresos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No hay datos de ventas aún</div>
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Gastos Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {recentExpenses && recentExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {recentExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {expense.category && (
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(expense.created_at).toLocaleDateString("es-AR")}
                            </span>
                          </div>
                        </div>
                        <p className="font-semibold text-destructive">${expense.amount.toLocaleString("es-AR")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-4">No hay gastos registrados</p>
                    <Button asChild size="sm">
                      <Link href="/admin/reportes/gastos">Agregar Gasto</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
