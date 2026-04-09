import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { ProductDetailClient } from "@/components/product-detail-client"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }> 
}) {
  const { id } = await params 
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products") 
    .select("*")
    .eq("id", id)
    .single()

  if (error || !product) {
    console.error("Error al buscar producto:", error?.message)
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </div>
  )
}