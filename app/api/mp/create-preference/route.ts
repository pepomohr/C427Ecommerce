import { MercadoPagoConfig, Preference } from "mercadopago"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })

export async function POST(req: NextRequest) {
  try {
    const { items, shipping, userId } = await req.json()

    if (!items?.length || !userId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const supabase = await createClient()

    // Calcular total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    )

    // Crear pedido pendiente en Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total,
        status: "pending",
        shipping_address: shipping,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("Error creando orden:", orderError)
      return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 })
    }

    // Crear los items del pedido
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))
    )

    if (itemsError) {
      console.error("Error creando items:", itemsError)
    }

    // Crear preferencia en Mercado Pago
    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item.product.id,
          title: item.product.name,
          quantity: item.quantity,
          unit_price: Number(item.product.price),
          currency_id: "ARS",
          picture_url: item.product.image_url ?? undefined,
        })),
        payer: {
          name: shipping?.fullName ?? "",
          phone: { number: shipping?.phone ?? "" },
          address: {
            street_name: shipping?.address ?? "",
            zip_code: shipping?.postalCode ?? "",
          },
        },
        back_urls: {
          success: `https://c427.com.ar/checkout/exito?order=${order.id}`,
          failure: `https://c427.com.ar/checkout?error=pago_fallido`,
          pending: `https://c427.com.ar/checkout/exito?order=${order.id}&status=pending`,
        },
        auto_return: "approved",
        notification_url: `https://c427.com.ar/api/mp/webhook`,
        external_reference: order.id,
        statement_descriptor: "C427 MEDICINA ESTETICA",
      },
    })

    return NextResponse.json({
      init_point: result.init_point,
      order_id: order.id,
    })
  } catch (error) {
    console.error("Error en create-preference:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
