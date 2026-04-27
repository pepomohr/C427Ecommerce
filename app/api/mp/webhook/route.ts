import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

// Cliente admin de Supabase para el webhook (bypasa RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function notificarNico(order: any) {
  const phone = process.env.NICO_PHONE
  const apiKey = process.env.CALLMEBOT_API_KEY

  if (!phone || !apiKey) return

  const productos = order.order_items
    ?.map((i: any) => `• ${i.product?.name ?? "Producto"} x${i.quantity}`)
    .join("\n") ?? ""

  const mensaje = encodeURIComponent(
    `🛒 *Nuevo Pedido C427!*\n\n` +
    `📦 Pedido: #${String(order.id).slice(0, 8).toUpperCase()}\n` +
    `${productos}\n\n` +
    `💰 Total: $${Number(order.total).toLocaleString("es-AR")}\n` +
    `✅ Estado: PAGADO\n\n` +
    `👤 Cliente: ${order.shipping_address?.fullName ?? "-"}\n` +
    `📍 Envío: ${order.shipping_address?.address ?? ""}, ${order.shipping_address?.city ?? ""}`
  )

  try {
    await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${mensaje}&apikey=${apiKey}`
    )
  } catch (err) {
    console.error("Error enviando notificación WhatsApp:", err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envía diferentes tipos de notificaciones
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Obtener datos del pago desde MP
    const payment = new Payment(mp)
    const paymentData = await payment.get({ id: paymentId })

    // Solo procesar pagos aprobados
    if (paymentData.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const orderId = paymentData.external_reference
    if (!orderId) return NextResponse.json({ ok: true })

    const supabase = getAdminClient()

    // Actualizar estado del pedido a "paid"
    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("*, order_items(quantity, product:products(name))")
      .single()

    if (error || !order) {
      console.error("Error actualizando orden:", error)
      return NextResponse.json({ ok: true })
    }

    // Notificar a Nico por WhatsApp
    await notificarNico(order)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en webhook MP:", error)
    // Siempre devolver 200 para que MP no reintente
    return NextResponse.json({ ok: true })
  }
}
