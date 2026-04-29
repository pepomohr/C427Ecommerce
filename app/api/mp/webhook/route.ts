import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmation, sendOrderNotificationToNico } from "@/lib/emails"
import { appendOrderToSheets } from "@/lib/google-sheets"

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

// Un solo cliente — todo en el mismo Supabase (Sistema C427)
function getSupabase() {
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

// Descuenta stock de cada producto en el mismo Supabase
async function decrementarStock(supabase: ReturnType<typeof getSupabase>, orderItems: any[]) {
  for (const item of orderItems) {
    const productId = item.product_id ?? item.product?.id
    const qty       = Number(item.quantity ?? 1)
    if (!productId) continue

    const { data } = await supabase
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single()

    if (data) {
      await supabase
        .from("products")
        .update({ stock: Math.max(0, (data.stock ?? 0) - qty) })
        .eq("id", productId)
    }
  }
  console.log("✅ Stock decrementado")
}

// Registra el ingreso como venta en la tabla sales del Sistema
async function registrarVenta(supabase: ReturnType<typeof getSupabase>, order: any, paymentMethod: string) {
  const metodoPago = (() => {
    if (paymentMethod?.includes("credit")) return "tarjeta"
    if (paymentMethod?.includes("debit")) return "tarjeta"
    return "transferencia"
  })()

  const items = order.order_items?.map((i: any) => ({
    itemId: i.product?.id ?? i.product_id ?? "web",
    itemName: i.product?.name ?? "Producto ecommerce",
    quantity: i.quantity,
    price: Number(i.price ?? 0),
    priceCashReference: Number(i.price ?? 0),
    type: "product",
    soldBy: null,
  })) ?? []

  const customerName = order.shipping_address?.fullName ?? "Cliente web"
  const pedidoId = String(order.id).slice(0, 8).toUpperCase()

  const { error } = await supabase.from("sales").insert({
    items,
    total: Number(order.total),
    payment_method: metodoPago,
    source: "web",
    type: "direct",
    patient_name: customerName,
    processed_by: "WEB C427",
    observations: `Pedido web #${pedidoId} | Tel: ${order.shipping_address?.phone ?? ""} | ${order.shipping_address?.address ?? ""}, ${order.shipping_address?.city ?? ""}`,
    date: new Date().toISOString(),
  })

  if (error) {
    console.error("❌ Error registrando venta en Sistema C427:", JSON.stringify(error))
    throw error
  }

  console.log("✅ Venta registrada en Sistema C427:", pedidoId)
}

// MP hace un GET para verificar que el endpoint existe antes de enviar notificaciones
export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    const paymentData = await new Payment(mp).get({ id: paymentId })
    if (paymentData.status !== "approved") return NextResponse.json({ ok: true })

    const orderId = paymentData.external_reference
    if (!orderId) return NextResponse.json({ ok: true })

    const supabase = getSupabase()

    // Actualizar orden a pagada
    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("*, order_items(quantity, price, product_id, product:products(name, id)), shipping_address")
      .single()

    if (error || !order) {
      console.error("Error actualizando orden:", error)
      return NextResponse.json({ ok: true })
    }

    const emailData = {
      orderId: order.id,
      customerName: order.shipping_address?.fullName ?? "Cliente",
      customerEmail: order.payer_email ?? "",
      items: order.order_items?.map((i: any) => ({
        name: i.product?.name ?? "Producto",
        quantity: i.quantity,
        price: Number(i.price ?? 0),
      })) ?? [],
      total: Number(order.total),
      shipping: {
        address: order.shipping_address?.address,
        city: order.shipping_address?.city,
        phone: order.shipping_address?.phone,
      },
    }

    const metodoPago = (() => {
      const t = paymentData.payment_type_id ?? ""
      if (t.includes("credit")) return "Tarjeta crédito"
      if (t.includes("debit")) return "Tarjeta débito"
      if (t === "account_money") return "Mercado Pago"
      return "Transferencia"
    })()

    const entrega = order.shipping_address?.deliveryMethod === "retiro"
      ? "Retiro en local"
      : `Envío: ${order.shipping_address?.address ?? ""}, ${order.shipping_address?.city ?? ""}`

    const resultados = await Promise.allSettled([
      notificarNico(order),
      registrarVenta(supabase, order, paymentData.payment_type_id ?? ""),
      decrementarStock(supabase, order.order_items ?? []),
      sendOrderConfirmation({ ...emailData, customerEmail: paymentData.payer?.email ?? order.payer_email ?? "" }),
      sendOrderNotificationToNico(emailData),
      appendOrderToSheets({
        pedidoId: String(order.id).slice(0, 8).toUpperCase(),
        cliente: order.shipping_address?.fullName ?? "Cliente web",
        telefono: order.shipping_address?.phone ?? "-",
        items: (order.order_items ?? []).map((i: any) => ({
          nombre: i.product?.name ?? "Producto",
          cantidad: Number(i.quantity ?? 1),
        })),
        total: Number(order.total),
        formaPago: metodoPago,
        entrega,
      }),
    ])

    // Log de errores para diagnosticar en Vercel
    resultados.forEach((r, i) => {
      const nombres = ["WhatsApp Nico", "Registrar venta", "Decrementar stock", "Email cliente", "Email Nico"]
      if (r.status === "rejected") {
        console.error(`❌ [webhook] Falló: ${nombres[i]}:`, r.reason)
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en webhook MP:", error)
    return NextResponse.json({ ok: true })
  }
}
