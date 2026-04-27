import { MercadoPagoConfig, Preference } from "mercadopago"
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
    const { items, shipping, userId } = await req.json()

    if (!items?.length || !userId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const supabase = getSupabase()

    const total = items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    )

    // PASO 1: Crear pedido en Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userId, total, status: "pending", shipping_address: shipping })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json({
        error: `Error Supabase (orden): ${orderError?.message ?? "sin respuesta"}`,
        detail: orderError?.hint ?? orderError?.details ?? null
      }, { status: 500 })
    }

    // PASO 2: Crear items del pedido
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))
    )

    if (itemsError) {
      return NextResponse.json({
        error: `Error Supabase (items): ${itemsError?.message}`,
        detail: itemsError?.hint ?? itemsError?.details ?? null
      }, { status: 500 })
    }

    // PASO 3: Crear preferencia en Mercado Pago
    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: String(item.product.id),
          title: item.product.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.product.price),
          currency_id: "ARS",
        })),
        back_urls: {
          success: `https://c427.com.ar/checkout/exito?order=${order.id}`,
          failure: `https://c427.com.ar/checkout?error=pago_fallido`,
          pending: `https://c427.com.ar/checkout/exito?order=${order.id}&status=pending`,
        },
        auto_return: "approved",
        notification_url: `https://c427.com.ar/api/mp/webhook`,
        external_reference: order.id,
        statement_descriptor: "C427 ESTETICA",
      },
    })

    if (!result.init_point) {
      return NextResponse.json({
        error: "Mercado Pago no devolvió el link de pago",
        detail: JSON.stringify(result)
      }, { status: 500 })
    }

    return NextResponse.json({ init_point: result.init_point, order_id: order.id })

  } catch (error: any) {
    return NextResponse.json({
      error: error?.message ?? "Error desconocido",
      detail: error?.cause?.toString() ?? error?.toString() ?? null
    }, { status: 500 })
  }
}
