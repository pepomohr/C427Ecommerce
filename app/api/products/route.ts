import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Un solo Supabase — Sistema C427
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/products?tag=antiedad&q=vitamina&id=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get("tag")
    const q   = searchParams.get("q")
    const id  = searchParams.get("id")

    const supabase = getSupabase()

    // ── Producto individual ──────────────────────────────────
    if (id) {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price_cash, price_list, stock, category, web_category, tags, image_url, web_visible, original_price, usage_mode, usage_results")
        .eq("id", id)
        .eq("web_visible", true)
        .single()

      if (error || !data) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      return NextResponse.json(mapProduct(data))
    }

    // ── Listado (solo productos marcados como visibles en web) ─
    let query = supabase
      .from("products")
      .select("id, name, description, price_cash, price_list, stock, category, web_category, tags, image_url, web_visible, original_price, usage_mode, usage_results")
      .eq("web_visible", true)
      .order("name")

    if (tag && tag !== "todos") {
      query = query.contains("tags", [tag.toLowerCase()])
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    let products = (data ?? []).map(mapProduct)

    if (q) {
      const lower = q.toLowerCase()
      products = products.filter(
        p => p.name.toLowerCase().includes(lower) || p.description?.toLowerCase().includes(lower)
      )
    }

    return NextResponse.json(products)

  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error desconocido" }, { status: 500 })
  }
}

// Normaliza el producto de Sistema al formato del ecommerce
function mapProduct(p: any) {
  return {
    id:             p.id,
    name:           p.name,
    description:    p.description ?? null,
    price:          Number(p.price_list ?? p.price_cash ?? 0),
    original_price: p.original_price ? Number(p.original_price) : null,
    stock:          Number(p.stock ?? 0),
    category:       p.web_category ?? p.category ?? null,
    tags:           p.tags ?? [],
    image_url:      p.image_url ?? null,
    is_active:      true,
    usage_mode:     p.usage_mode ?? null,
    usage_results:  p.usage_results ?? null,
    created_at:     "",
    updated_at:     "",
  }
}
