// app/api/checkout/route.ts (o el nombre de tu archivo de creación de checkout)

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from 'mercadopago'; 

// 1. Inicialización de Mercado Pago (Versión 2)
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Autenticación del usuario
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { items, shipping } = body 

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 })
    }

    // 2. Lógica de Stock y Creación de Orden en Supabase
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
    if (itemsError) throw itemsError

    // RPC para stock
    for (const item of items) {
      await supabase.rpc("decrement_stock", {
        product_id: item.product_id,
        quantity: item.quantity,
      })
    }

    // 3. CREACIÓN DE LA PREFERENCIA (Versión 2)
    const preference = new Preference(client);

    const itemsMP = items.map((item: any) => ({
        id: item.product_id,
        title: item.name, 
        unit_price: Number(item.price), // Aseguramos que sea número
        quantity: Number(item.quantity),
        currency_id: 'ARS',
    }));

    const responseMP = await preference.create({
        body: {
            items: itemsMP,
            payer: {
                email: user.email, 
            },
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/exito`, 
                failure: `${process.env.NEXT_PUBLIC_SITE_URL}/carrito`, 
                pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pendiente`,
            },
            notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/confirm-payment`, 
            external_reference: String(order.id), 
            auto_return: "approved",
        }
    });

    // 4. ACTUALIZAR ID EN SUPABASE
    // En la V2, los datos vienen directo en el objeto de respuesta, no en .body
    await supabase
        .from('orders')
        .update({ mp_preference_id: responseMP.id })
        .eq('id', order.id);

    // 5. DEVOLVER EL LINK DE PAGO
    return NextResponse.json({
      orderId: order.id,
      preferenceId: responseMP.id,
      init_point: responseMP.init_point, 
    })

  } catch (error: any) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json({ error: error.message || "Error al procesar el pago" }, { status: 500 })
  }
}