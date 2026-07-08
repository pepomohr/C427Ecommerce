import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Nunca cachear: los precios se actualizan desde el Sistema C427 y tienen que
// verse en la web al instante. Sin esto, Vercel Edge y el navegador cacheaban
// la lista vieja y los clientes veían precios que ya habíamos cambiado.
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Lee productos del Sistema C427 (misma base que el admin).
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
}

// GET /api/products?tag=antiedad&q=vitamina&id=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get("tag")
    const q   = searchParams.get("q")
    const id  = searchParams.get("id")

    const supabase = getSupabase()

    if (id) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single()

      if (error || !data) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404, headers: NO_CACHE_HEADERS })
      return NextResponse.json(data, { headers: NO_CACHE_HEADERS })
    }

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (tag && tag !== "todos") {
      query = query.contains("tags", [tag.toLowerCase()])
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    let products = data ?? []

    if (q) {
      const lower = q.toLowerCase()
      products = products.filter(
        (p: any) =>
          p.nombre_web?.toLowerCase().includes(lower) ||
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      )
    }

    return NextResponse.json(products, { headers: NO_CACHE_HEADERS })

  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error desconocido" }, { status: 500, headers: NO_CACHE_HEADERS })
  }
}
