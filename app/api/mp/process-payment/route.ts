import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { sendOrderConfirmation, sendOrderNotificationToNico } from "@/lib/emails"

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getSistemaClient() {
  return createClient(
    process.env.SISTEMA_SUPABASE_URL!,
    process.env.SISTEMA_SERVICE_ROLE_KEY!
  )
}

async function registrarEnSistema(order: any, items: any[], total: number, shipping: any, paymentMethodId: string) {
  if (!process.env.SISTEMA_SUPABASE_URL || !process.env.SISTEMA_SERVICE_ROLE_KEY) return
  try {
    const sistema = getSistemaClient()
    const metodoPago = paymentMethodId?.includes("credit") ? "tarjeta"
      : paymentMethodId?.includes("debit") ? "tarjeta"
      : "tarjeta"

    const saleItems = items.map((i: any) => ({
      itemId: i.product?.id ?? "web",
      itemName: i.product?.name ?? "Producto ecommerce",
      quantity: i.quantity,
      price: Number(i.product?.price ?? 0),
      priceCashReference: Number(i.product?.price ?? 0),
      total: Number(i.product?.price ?? 0) * i.quantity,
      type: "product",
      soldBy: null,
    }))

    const pedidoId = String(order.id).slice(0, 8).toUpperCase()
    await sistema.from("sales").insert({
      items: saleItems,
      total: Number(total),
      payment_method: metodoPago,
      source: "web",
      type: "direct",
      patient_name: shipping?.fullName ?? "Cliente web",
      processed_by: null,
      observations: `Pedido web #${pedidoId} | Tel: ${shipping?.phone ?? ""} | ${shipping?.address ?? ""}, ${shipping?.city ?? ""}`,
      date: new Date().toISOString(),
    })
    console.log("✅ Venta tarjeta registrada en Sistema C427")
  } catch (err) {
    console.error("Error registrando en Sistema C427:", err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      token, installments, paymentMethodId, issuerId,
      identificationType, identificationNumber,
      items, shipping, userId, email
    } = await req.json()

    if (!token || !userId || !items?.length) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const supabase = getSupabase()

    const total = items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    )

    // Crear pedido en Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userId, total, status: "pending", shipping_address: shipping })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: `Error creando orden: ${orderError?.message}` }, { status: 500 })
    }

    await supabase.from("order_items").insert(
      items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))
    )

    // Procesar pago con tarjeta via MP
    const payment = new Payment(mp)
    const result = await payment.create({
      body: {
        transaction_amount: Number(total),
        token,
        description: `Pedido C427 #${order.id.slice(0, 8)}`,
        installments: Number(installments ?? 1),
        payment_method_id: paymentMethodId,
        issuer_id: issuerId ? Number(issuerId) : undefined,
        payer: {
          email,
          first_name: shipping?.fullName?.split(" ")[0] ?? "",
          last_name: shipping?.fullName?.split(" ").slice(1).join(" ") ?? "",
          identification: identificationType && identificationNumber
            ? { type: identificationType, number: identificationNumber }
            : undefined,
        },
        external_reference: order.id,
        notification_url: `https://c427.com.ar/api/mp/webhook`,
      },
    })

    if (result.status === "approved") {
      await supabase
        .from("orders")
        .update({ status: "paid", payment_id: String(result.id) })
        .eq("id", order.id)

      const emailData = {
        orderId: order.id,
        customerName: shipping?.fullName ?? "Cliente",
        customerEmail: email ?? "",
        items: items.map((i: any) => ({
          name: i.product?.name ?? "Producto",
          quantity: i.quantity,
          price: Number(i.product?.price ?? 0),
        })),
        total: Number(total),
        shipping: {
          address: shipping?.address,
          city: shipping?.city,
          phone: shipping?.phone,
        },
      }

      // Todo en paralelo: emails + Sistema (sin bloquear respuesta)
      Promise.allSettled([
        sendOrderConfirmation(emailData),
        sendOrderNotificationToNico(emailData),
        registrarEnSistema(order, items, total, shipping, paymentMethodId ?? ""),
      ])

      return NextResponse.json({ status: "approved", order_id: order.id })
    }

    if (result.status === "in_process" || result.status === "pending") {
      return NextResponse.json({ status: "pending", order_id: order.id })
    }

    // Pago rechazado — traducir el código de MP a mensaje legible
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id)

    const rejectionMessages: Record<string, string> = {
      cc_rejected_high_risk:          "El pago fue rechazado por seguridad. Intentá con otra tarjeta o pagá con Mercado Pago.",
      cc_rejected_call_for_authorize: "Tu banco requiere que los autorices. Llamá al número del dorso de tu tarjeta e intentá de nuevo.",
      cc_rejected_insufficient_amount:"Saldo insuficiente en la tarjeta.",
      cc_rejected_bad_filled_card_number: "Número de tarjeta incorrecto. Verificá y volvé a intentar.",
      cc_rejected_bad_filled_date:    "Fecha de vencimiento incorrecta.",
      cc_rejected_bad_filled_security_code: "Código de seguridad incorrecto.",
      cc_rejected_blacklist:          "La tarjeta no está habilitada para este tipo de pago.",
      cc_rejected_duplicated_payment: "Este pago ya fue procesado anteriormente.",
      cc_rejected_card_disabled:      "La tarjeta está deshabilitada. Contactá a tu banco.",
    }

    const statusDetail = result.status_detail ?? ""
    const friendlyError = rejectionMessages[statusDetail]
      ?? `Pago rechazado (${statusDetail || "motivo desconocido"}). Intentá con Mercado Pago.`

    console.error("Pago rechazado:", { status: result.status, status_detail: statusDetail })

    return NextResponse.json({
      status: "rejected",
      error: friendlyError,
      status_detail: statusDetail,
    }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({
      error: error?.message ?? "Error procesando el pago",
    }, { status: 500 })
  }
}
