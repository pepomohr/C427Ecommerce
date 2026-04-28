import { NextResponse } from "next/server"
import { sendOrderConfirmation, sendOrderNotificationToNico } from "@/lib/emails"

export async function GET() {
  const testData = {
    orderId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    customerName: "María García",
    customerEmail: "nicomohr86@gmail.com",
    items: [
      { name: "Contorno de Ojos C427", quantity: 1, price: 25000 },
      { name: "Suero Antioxidante Vitamina C", quantity: 2, price: 18500 },
    ],
    total: 62000,
    shipping: {
      address: "Av. Corrientes 1234",
      city: "Buenos Aires",
      phone: "11 1234-5678",
    },
  }

  await sendOrderConfirmation(testData)
  await sendOrderConfirmation({ ...testData, customerEmail: "nicomohr19@gmail.com" })
  await sendOrderNotificationToNico(testData)

  return NextResponse.json({ ok: true, message: "Emails de prueba enviados" })
}
