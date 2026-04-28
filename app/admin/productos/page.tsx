"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Search, Edit, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SistemaProduct {
  id: string
  name: string
  description?: string | null
  price_cash: number
  price_list: number
  stock: number
  category?: string | null
  web_category?: string | null
  image_url?: string | null
  web_visible: boolean
  tags?: string[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<SistemaProduct[]>([])
  const [filtered, setFiltered] = useState<SistemaProduct[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadProducts() }, [])

  useEffect(() => {
    const q = searchQuery.toLowerCase()
    setFiltered(
      q
        ? products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
          )
        : products
    )
  }, [products, searchQuery])

  async function loadProducts() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price_cash, price_list, stock, category, web_category, image_url, web_visible, tags")
      .order("name")

    if (data && !error) setProducts(data)
    setIsLoading(false)
  }

  async function toggleWebVisible(productId: string, current: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from("products")
      .update({ web_visible: !current })
      .eq("id", productId)

    if (!error) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, web_visible: !current } : p))
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} isAdmin={true} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Gestión de Productos</h1>
              <p className="text-muted-foreground mt-2">
                El ojo activa/desactiva la visibilidad en la web. El stock se descuenta automáticamente al vender.
              </p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Productos ({filtered.length})
                <span className="ml-3 text-sm font-normal text-muted-foreground">
                  {products.filter(p => p.web_visible).length} visibles en web
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando productos...</div>
              ) : filtered.length > 0 ? (
                <div className="space-y-3">
                  {filtered.map((product) => (
                    <div
                      key={product.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-opacity ${
                        !product.web_visible ? "opacity-50" : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={product.image_url || "/placeholder.svg?height=100&width=100"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <Badge variant="secondary">
                            {product.web_category ?? product.category ?? "-"}
                          </Badge>
                          {!product.web_visible && (
                            <Badge variant="outline" className="text-muted-foreground">Oculto en web</Badge>
                          )}
                          {product.stock <= 5 && product.web_visible && (
                            <Badge variant="outline" className="border-destructive text-destructive">
                              Stock bajo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-semibold">
                            ${Number(product.price_list || product.price_cash || 0).toLocaleString("es-AR")}
                          </span>
                          <span className="text-muted-foreground">Stock: {product.stock}</span>
                          {product.tags && product.tags.length > 0 && (
                            <span className="text-muted-foreground text-xs">
                              {product.tags.slice(0, 3).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/productos/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant={product.web_visible ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleWebVisible(product.id, product.web_visible)}
                          title={product.web_visible ? "Ocultar en web" : "Mostrar en web"}
                        >
                          {product.web_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
