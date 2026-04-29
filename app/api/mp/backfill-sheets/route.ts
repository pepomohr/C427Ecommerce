import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { appendOrderToSheets } from "@/lib/google-sheets"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (secret !== "c427admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = getSupabase()

  // Traer todas las órdenes pagas y de whatsapp
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, total, status, shipping_address, created_at, payment_id")
    .in("status", ["paid", "pending_whatsapp"])
    .order("created_at", { ascending: true })

  if (error || !orders) {
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }

  let ok = 0
  let failed = 0

  for (const order of orders) {
    try {
      // Items por separado
      const { data: items } = await supabase
        .from("order_items")
        .select("quantity, price, product_id, products(name)")
        .eq("order_id", order.id)

      const fecha = new Date(order.created_at).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })

      const entrega = order.shipping_address?.deliveryMethod === "retiro"
        ? "Retiro en local"
        : `Envío: ${order.shipping_address?.address ?? ""}, ${order.shipping_address?.city ?? ""}`.trim().replace(/,\s*$/, "")

      const formaPago = order.status === "pending_whatsapp"
        ? "Transferencia"
        : (order.payment_id ? "Mercado Pago" : "Tarjeta")

      await appendOrderToSheets({
        pedidoId: String(order.id).slice(0, 8).toUpperCase(),
        cliente: order.shipping_address?.fullName ?? "Cliente",
        telefono: order.shipping_address?.phone ?? "-",
        items: (items ?? []).map((i: any) => ({
          nombre: i.products?.name ?? "Producto",
          cantidad: Number(i.quantity ?? 1),
        })),
        total: Number(order.total),
        formaPago,
        entrega,
      })

      ok++
      // Pequeña pausa para no saturar el Apps Script
      await new Promise(r => setTimeout(r, 300))
    } catch (err) {
      console.error("Error procesando orden", order.id, err)
      failed++
    }
  }

  return NextResponse.json({
    ok: true,
    total: orders.length,
    cargadas: ok,
    fallidas: failed,
  })
}
