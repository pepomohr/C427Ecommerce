import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { items, shipping } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 })
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Create order
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

    // Create order items
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

    // Update product stock
    for (const item of items) {
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        product_id: item.product_id,
        quantity: item.quantity,
      })

      if (stockError) {
        console.error("[v0] Error updating stock:", stockError)
      }
    }

    // In production, create Mercado Pago preference here
    // For demo purposes, we'll return the order ID without preference
    const preferenceId = null // Would be created with Mercado Pago SDK

    return NextResponse.json({
      orderId: order.id,
      preferenceId,
    })
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    return NextResponse.json({ error: "Error al procesar la orden" }, { status: 500 })
  }
}
