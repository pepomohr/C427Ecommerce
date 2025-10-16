import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, paymentId } = body

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_id: paymentId,
      })
      .eq("id", orderId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error confirming payment:", error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Payment confirmation error:", error)
    return NextResponse.json({ error: "Error al confirmar el pago" }, { status: 500 })
  }
}
