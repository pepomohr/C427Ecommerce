import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { createClient } from "@supabase/supabase-js"
import { ProductDetailClient } from "@/components/product-detail-client"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getProduct(id: string) {
  const { data } = await getSupabase()
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single()
  if (!data) return null
  return {
    id:             data.id,
    name:           data.name,
    nombre_web:     data.nombre_web ?? null,
    description:    data.description ?? null,
    price:          Number(data.price ?? 0),
    original_price: data.original_price ? Number(data.original_price) : null,
    stock:          Number(data.stock ?? 0),
    category:       data.category ?? null,
    tags:           data.tags ?? [],
    image_url:      data.image_url ?? null,
    is_active:      data.is_active ?? true,
    usage_mode:     data.usage_mode ?? null,
    usage_results:  data.usage_results ?? null,
    created_at:     data.created_at ?? "",
    updated_at:     data.updated_at ?? "",
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscás no está disponible.",
    }
  }

  const image = product.image_url ?? "/c427logodorado.png"
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
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: product.image_url ? [product.image_url] : [],
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