"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Edit, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchQuery])

  async function loadProducts() {
    const supabase = createClient()
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (data && !error) {
      setProducts(data)
    }
    setIsLoading(false)
  }

  function filterProducts() {
    let filtered = [...products]

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredProducts(filtered)
  }

  async function toggleProductStatus(productId: string, currentStatus: boolean) {
    const supabase = createClient()
    const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId)

    if (!error) {
      loadProducts()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} isAdmin={true} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold">Gestión de Productos</h1>
              <p className="text-muted-foreground mt-2">Administra el catálogo de productos</p>
            </div>
            <Button asChild>
              <Link href="/admin/productos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Link>
            </Button>
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
                Productos ({filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando productos...</div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-3">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30">
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
                          <Badge variant="secondary">{product.category}</Badge>
                          {!product.is_active && <Badge variant="destructive">Inactivo</Badge>}
                          {product.stock <= 10 && product.is_active && (
                            <Badge variant="outline" className="border-destructive text-destructive">
                              Stock Bajo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-semibold">${product.price.toLocaleString("es-AR")}</span>
                          <span className="text-muted-foreground">Stock: {product.stock}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/productos/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProductStatus(product.id, product.is_active)}
                        >
                          {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No se encontraron productos</p>
                  <Button asChild>
                    <Link href="/admin/productos/nuevo">Agregar Primer Producto</Link>
                  </Button>
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
