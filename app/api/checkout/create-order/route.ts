import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import mercadopago from 'mercadopago'; // ⬅️ Importamos el SDK

// Inicialización de Mercado Pago
// Usamos el Access Token del .env.local para la autenticación en el servidor
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Autenticación del usuario
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    // ASUMIMOS que items incluye: id, name, price, quantity (necesario para MP)
    const { items, shipping } = body 

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 })
    }

    // 2. Lógica de Stock y Creación de Orden en Supabase
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Crear orden (Estado: pending)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Error creating order:", orderError)
      throw orderError
    }

    // Crear items de la orden (Relación)
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Error creating order items:", itemsError)
      throw itemsError
    }

    // Actualizar stock (RPC)
    for (const item of items) {
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        product_id: item.product_id,
        quantity: item.quantity,
      })

      if (stockError) {
        console.error("[v0] Error updating stock:", stockError)
      }
    }

    // 3. CREACIÓN DE LA PREFERENCIA DE MERCADO PAGO
    
    // Mapeo de Items al formato MP
    const itemsMP = items.map((item: any) => ({
        title: item.name, 
        unit_price: item.price,
        quantity: item.quantity,
        id: item.product_id, // Usamos el ID del producto
        currency_id: 'ARS', // Argentina
    }));

    const preference = {
        items: itemsMP,
        payer: {
            email: user.email, 
        },
        back_urls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/exito`, 
            failure: `${process.env.NEXT_PUBLIC_SITE_URL}/carrito`, 
            pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pendiente`,
        },
        // Usamos la order.id de Supabase como referencia externa
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout/confirm-payment`, 
        external_reference: order.id.toString(), 
        auto_return: "approved",
    };

    const responseMP = await mercadopago.preferences.create(preference);

    // 4. GUARDAR ID DE PREFERENCIA DE MP EN LA ORDEN DE SUPABASE (Opcional, pero bueno)
    // Asumo que tienes una columna 'mp_preference_id' en tu tabla 'orders'.
    const { error: mpUpdateError } = await supabase
        .from('orders')
        .update({ mp_preference_id: responseMP.body.id })
        .eq('id', order.id);

    if (mpUpdateError) {
        console.error("[v0] Error updating order with MP ID:", mpUpdateError);
    }

    // 5. DEVOLVER EL LINK DE PAGO
    return NextResponse.json({
      orderId: order.id,
      preferenceId: responseMP.body.id,
      init_point: responseMP.body.init_point, // Link al que redirigir
    })
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json({ error: "Error al procesar la orden de pago" }, { status: 500 })
  }
}