import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Lee de la base del ecommerce (NEXT_PUBLIC_SUPABASE_URL = zdqrsoqashegymvqbkmm)
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

    if (id) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single()

      if (error || !data) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
      return NextResponse.json(data)
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

    return NextResponse.json(products)

  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Error desconocido" }, { status: 500 })
  }
}
