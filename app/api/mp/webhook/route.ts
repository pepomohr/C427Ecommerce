import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmation, sendOrderNotificationToNico } from "@/lib/emails"

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

// Cliente admin del ecommerce (bypasa RLS)
function getEcommerceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Cliente admin del Sistema C427 (para registrar la venta)
function getSistemaClient() {
  return createClient(
    process.env.SISTEMA_SUPABASE_URL!,
    process.env.SISTEMA_SERVICE_ROLE_KEY!
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

// Registra el ingreso del ecommerce en el Sistema C427
async function registrarEnSistema(order: any, paymentMethod: string) {
  if (!process.env.SISTEMA_SUPABASE_URL || !process.env.SISTEMA_SERVICE_ROLE_KEY) return

  try {
    const sistema = getSistemaClient()

    // Mapear método de pago de MP al formato del Sistema
    const metodoPago = (() => {
      if (paymentMethod?.includes("credit")) return "tarjeta"
      if (paymentMethod?.includes("debit")) return "tarjeta"
      if (paymentMethod?.includes("account_money")) return "transferencia"
      return "transferencia"
    })()

    // Armar los items en el formato del Sistema
    const items = order.order_items?.map((i: any) => ({
      itemId: i.product?.id ?? "web",
      itemName: i.product?.name ?? "Producto ecommerce",
      quantity: i.quantity,
      price: Number(i.price ?? 0),
      priceCashReference: Number(i.price ?? 0),
      total: Number(i.price ?? 0) * i.quantity,
      type: "product",
      soldBy: null,
    })) ?? []

    const customerName = order.shipping_address?.fullName ?? "Cliente web"
    const pedidoId = String(order.id).slice(0, 8).toUpperCase()

    await sistema.from("sales").insert({
      items,
      total: Number(order.total),
      payment_method: metodoPago,
      source: "web",       // → muestra badge "Web C427" en el Sistema
      type: "direct",      // → cuenta como venta directa
      patient_name: customerName,  // → aparece en columna PACIENTE
      processed_by: null,
      observations: `Pedido web #${pedidoId} | Tel: ${order.shipping_address?.phone ?? ""} | ${order.shipping_address?.address ?? ""}, ${order.shipping_address?.city ?? ""}`,
      date: new Date().toISOString(),
    })

    console.log("✅ Venta registrada en Sistema C427")
  } catch (err) {
    // No interrumpir el flujo si el Sistema falla
    console.error("Error registrando en Sistema C427:", err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Obtener datos del pago desde MP
    const payment = new Payment(mp)
    const paymentData = await payment.get({ id: paymentId })

    if (paymentData.status !== "approved") {
      return NextResponse.json({ ok: true })
    }

    const orderId = paymentData.external_reference
    if (!orderId) return NextResponse.json({ ok: true })

    const supabase = getEcommerceClient()

    // Actualizar orden a pagada en el ecommerce
    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("*, order_items(quantity, price, product:products(name)), shipping_address")
      .single()

    if (error || !order) {
      console.error("Error actualizando orden:", error)
      return NextResponse.json({ ok: true })
    }

    // Preparar datos de email
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

    // Ejecutar en paralelo: emails + WhatsApp + registrar en Sistema
    await Promise.allSettled([
      notificarNico(order),
      registrarEnSistema(order, paymentData.payment_type_id ?? ""),
      sendOrderConfirmation({ ...emailData, customerEmail: paymentData.payer?.email ?? order.payer_email ?? "" }),
      sendOrderNotificationToNico(emailData),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error en webhook MP:", error)
    return NextResponse.json({ ok: true })
  }
}
