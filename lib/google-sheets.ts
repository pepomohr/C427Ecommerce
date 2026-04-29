/**
 * Registra un pedido pagado en Google Sheets (Pedidos por WEB)
 * Llama al Apps Script desplegado como web app
 */
export async function appendOrderToSheets(params: {
  pedidoId: string
  cliente: string
  telefono: string
  items: Array<{ nombre: string; cantidad: number }>
  total: number
  formaPago: string
  entrega: string
}) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!url) {
    console.warn("⚠️ GOOGLE_SHEETS_WEBHOOK_URL no configurada")
    return
  }

  const fecha = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.GOOGLE_SHEETS_SECRET ?? "c427pedidos",
        fecha,
        ...params,
      }),
    })
    const data = await res.json()
    if (data.ok) {
      console.log("✅ Pedido registrado en Google Sheets:", params.pedidoId)
    } else {
      console.error("❌ Error en Google Sheets:", data.error)
    }
  } catch (err) {
    console.error("❌ Error llamando Google Sheets webhook:", err)
  }
}
