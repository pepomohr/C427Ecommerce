import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { secret } = await req.json()
  if (secret !== "c427admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  const sheetSecret = process.env.GOOGLE_SHEETS_SECRET ?? "c427pedidos"

  if (!url) {
    return NextResponse.json({ error: "GOOGLE_SHEETS_WEBHOOK_URL no está configurada en Vercel" }, { status: 500 })
  }

  const payload = {
    secret: sheetSecret,
    fecha: "29/04/2026 12:00",
    pedidoId: "TEST0001",
    cliente: "Test Cliente",
    telefono: "1112345678",
    items: [{ nombre: "Producto Test", cantidad: 1 }],
    total: 1000,
    formaPago: "Transferencia",
    entrega: "Retiro en local - MAIPU 170",
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const status = res.status
    const text = await res.text()

    let parsed: any = null
    try { parsed = JSON.parse(text) } catch { /* not json */ }

    return NextResponse.json({
      webhookUrl: url.slice(0, 60) + "...",
      secretUsed: sheetSecret,
      httpStatus: status,
      rawResponse: text.slice(0, 500),
      parsedResponse: parsed,
    })
  } catch (err: any) {
    return NextResponse.json({
      error: "fetch falló",
      detail: err?.message ?? String(err),
      webhookUrl: url.slice(0, 60) + "...",
    }, { status: 500 })
  }
}
