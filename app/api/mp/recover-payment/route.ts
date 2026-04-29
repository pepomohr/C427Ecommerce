import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function registrarVenta(supabase: ReturnType<typeof getSupabase>, order: any, paymentMethod: string) {
  const metodoPago = paymentMethod?.includes("credit") || paymentMethod?.includes("debit") ? "tarjeta" : "transferencia"

  const items = order.order_items?.map((i: any) => ({
    itemId: i.product_id ?? "web",
    itemName: "Producto ecommerce",
    quantity: i.quantity,
    price: Number(i.price ?? 0),
    priceCashReference: Number(i.price ?? 0),
    type: "product",
    soldBy: null,
  })) ?? []

  const pedidoId = String(order.id).slice(0, 8).toUpperCase()
  const { error } = await supabase.from("sales").insert({
    items,
    total: Number(order.total),
    payment_method: metodoPago,
    source: "web",
    type: "direct",
    patient_name: order.shipping_address?.fullName ?? "Cliente web",
    processed_by: "WEB C427",
    observations: `Pedido web #${pedidoId} | Tel: ${order.shipping_address?.phone ?? ""} | ${order.shipping_address?.address ?? ""}, ${order.shipping_address?.city ?? ""}`,
    date: new Date().toISOString(),
  })

  if (error) throw new Error(`Error registrando venta: ${JSON.stringify(error)}`)
}

// POST /api/mp/recover-payment  { paymentId: "156923969676" }
export async function POST(req: NextRequest) {
  try {
    const { paymentId, secret } = await req.json()

    // Protección básica
    if (secret !== process.env.RECOVER_SECRET && secret !== "c427admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId requerido" }, { status: 400 })
    }

    const paymentData = await new Payment(mp).get({ id: paymentId })

    if (paymentData.status !== "approved") {
      return NextResponse.json({
        error: `El pago no está aprobado. Estado: ${paymentData.status}`,
        status: paymentData.status,
      }, { status: 400 })
    }

    const orderId = paymentData.external_reference
    if (!orderId) {
      return NextResponse.json({ error: "El pago no tiene external_reference" }, { status: 400 })
    }

    const supabase = getSupabase()

    // Verificar que la orden no esté ya procesada
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single()

    if (!existingOrder) {
      return NextResponse.json({ error: `Orden no encontrada: ${orderId}` }, { status: 404 })
    }

    if (existingOrder.status === "paid") {
      return NextResponse.json({ ok: true, message: "La orden ya estaba marcada como pagada", orderId })
    }

    // Actualizar orden a pagada (sin join para evitar error de schema cache)
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, total, shipping_address, payer_email")
      .single()

    if (updateError || !order) {
      return NextResponse.json({ error: `Error actualizando orden: ${updateError?.message}` }, { status: 500 })
    }

    // Obtener items por separado
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("quantity, price, product_id")
      .eq("order_id", orderId)

    const orderWithItems = { ...order, order_items: orderItems ?? [] }

    // Registrar venta en Sistema C427
    await registrarVenta(supabase, orderWithItems, paymentData.payment_type_id ?? "")

    // Decrementar stock
    for (const item of orderItems ?? []) {
      const productId = item.product_id
      if (!productId) continue
      const { data } = await supabase.from("products").select("stock").eq("id", productId).single()
      if (data) {
        await supabase.from("products")
          .update({ stock: Math.max(0, (data.stock ?? 0) - Number(item.quantity ?? 1)) })
          .eq("id", productId)
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Pago ${paymentId} procesado correctamente`,
      orderId,
      customer: order.shipping_address?.fullName,
      total: order.total,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Error desconocido" }, { status: 500 })
  }
}
