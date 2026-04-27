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

export async function POST(req: NextRequest) {
  try {
    const { token, installments, paymentMethodId, issuerId, items, shipping, userId, email } = await req.json()

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
        },
        external_reference: order.id,
        notification_url: `https://c427.com.ar/api/mp/webhook`,
      },
    })

    if (result.status === "approved") {
      // Actualizar orden a pagada
      await supabase
        .from("orders")
        .update({ status: "paid", payment_id: String(result.id) })
        .eq("id", order.id)

      return NextResponse.json({ status: "approved", order_id: order.id })
    }

    if (result.status === "in_process" || result.status === "pending") {
      return NextResponse.json({ status: "pending", order_id: order.id })
    }

    // Pago rechazado
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id)
    return NextResponse.json({
      status: "rejected",
      error: "El pago fue rechazado. Verificá los datos de tu tarjeta.",
    }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({
      error: error?.message ?? "Error procesando el pago",
    }, { status: 500 })
  }
}
