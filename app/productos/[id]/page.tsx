import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { ArrowLeft, Package, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get product
  const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error || !product) {
    notFound()
  }

  const isOutOfStock = product.stock === 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/productos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Link>
          </Button>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image_url || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {isOutOfStock && (
                <Badge variant="destructive" className="absolute top-4 right-4 text-base px-3 py-1">
                  Agotado
                </Badge>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <div className="mb-4">
                <Badge variant="secondary" className="mb-3">
                  {product.category}
                </Badge>
                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                <p className="text-4xl font-bold mb-6" style={{ color: "oklch(0.35 0.08 160)" }}>
                  ${product.price.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-2">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "Sin descripción disponible"}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Stock disponible: <span className="font-medium text-foreground">{product.stock} unidades</span>
                  </span>
                </div>
              </div>

              <AddToCartButton product={product} className="w-full mb-4" size="lg" />

              {/* Features */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Compra Segura</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Pagos protegidos con Mercado Pago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold mb-1">Envío Rápido</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Recibí tu pedido en 3-5 días hábiles
                        </p>
                      </div>
                    </div>
                  </div>
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
