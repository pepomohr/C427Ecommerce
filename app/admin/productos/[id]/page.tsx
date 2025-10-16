"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import Link from "next/link"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [productId, setProductId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [category, setCategory] = useState<"Facial" | "Corporal">("Facial")
  const [imageUrl, setImageUrl] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    params.then((p) => {
      setProductId(p.id)
      loadProduct(p.id)
    })
  }, [])

  async function loadProduct(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (data && !error) {
      setName(data.name)
      setDescription(data.description || "")
      setPrice(data.price.toString())
      setStock(data.stock.toString())
      setCategory(data.category)
      setImageUrl(data.image_url || "")
      setIsActive(data.is_active)
    }

    setIsLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productId) return

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("products")
        .update({
          name,
          description,
          price: Number.parseFloat(price),
          stock: Number.parseInt(stock),
          category,
          image_url: imageUrl,
          is_active: isActive,
        })
        .eq("id", productId)

      if (error) throw error

      router.push("/admin/productos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar el producto")
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!productId) return
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) throw error

      router.push("/admin/productos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el producto")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header isAuthenticated={true} isAdmin={true} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={true} isAdmin={true} />

      <main className="flex-1">
        <div className="container px-4 md:px-6 py-8 md:py-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/admin/productos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a productos
            </Link>
          </Button>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Editar Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Producto *</Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Serum Vitamina C"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe el producto..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio (ARS) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="4500.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={category} onValueChange={(value: "Facial" | "Corporal") => setCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Facial">Facial</SelectItem>
                        <SelectItem value="Corporal">Corporal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">URL de Imagen</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive">Estado</Label>
                    <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </Button>
                    <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                      <Link href="/admin/productos">Cancelar</Link>
                    </Button>
                  </div>

                  <div className="pt-6 border-t">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      className="w-full"
                      disabled={isSaving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar Producto
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
