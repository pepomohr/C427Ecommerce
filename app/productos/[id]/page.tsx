import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { ProductDetailClient } from "@/components/product-detail-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from("products")
    .select("name, description, images, price, category")
    .eq("id", id)
    .single()

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscás no está disponible.",
    }
  }

  const image = product.images?.[0] ?? "/c427logodorado.png"
  const price = product.price ? `$${product.price}` : ""
  const title = `${product.name}${price ? ` - ${price}` : ""}`
  const description =
    product.description?.slice(0, 155) ??
    `${product.name} en C427 Medicina Estética. Productos dermocosméticos de alta calidad con respaldo médico.`

  return {
    title,
    description,
    alternates: {
      canonical: `/productos/${id}`,
    },
    openGraph: {
      title: `${product.name} | C427 Medicina Estética`,
      description,
      url: `https://c427.com.ar/productos/${id}`,
      images: [
        {
          url: image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | C427`,
      description,
      images: [image],
    },
  }
}

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

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: product.images ?? [],
    brand: {
      "@type": "Brand",
      name: "C427 Medicina Estética",
    },
    offers: {
      "@type": "Offer",
      url: `https://c427.com.ar/productos/${id}`,
      priceCurrency: "ARS",
      price: product.price ?? 0,
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "C427 Medicina Estética",
      },
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Header />
      <main className="flex-1">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
    </div>
  )
}