import { Resend } from "resend"

// Inicialización lazy para que no falle en build sin env vars
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface EmailOrderData {
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  shipping: {
    address?: string
    city?: string
    phone?: string
  }
}

// ─── Email de confirmación al cliente ────────────────────────────────────────

function buildConfirmationEmail(data: EmailOrderData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#3d2b1f;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#3d2b1f;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe5;font-size:14px;color:#936c43;font-weight:bold;text-align:right;">$${(item.price * item.quantity).toLocaleString("es-AR")}</td>
      </tr>`
    )
    .join("")

  const orderId = data.orderId.slice(0, 8).toUpperCase()
  const waLink = `https://wa.me/5491160352289?text=Hola!%20Quiero%20confirmar%20mi%20pedido.%20Mi%20ID%20de%20compra%20es%3A%20%23${orderId}`

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(147,108,67,0.15);">

        <!-- Header: logo sobre fondo blanco -->
        <tr>
          <td style="background:#ffffff;padding:32px 40px 20px;text-align:center;border-bottom:3px solid #936c43;">
            <img src="https://c427.com.ar/apple-touch-icon.png" alt="C427" width="90" height="90" style="display:block;margin:0 auto 10px;border-radius:18px;" />
            <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:700;color:#936c43;">Medicina Estética</p>
          </td>
        </tr>

        <!-- PASO OBLIGATORIO — primero y grande -->
        <tr>
          <td style="background:#936c43;padding:24px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:18px;font-weight:900;color:#fff;letter-spacing:1px;">⚠️ PASO OBLIGATORIO</p>
            <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.92);line-height:1.6;">
              Para procesar tu envío debés enviarnos tu ID de compra por WhatsApp.<br>
              <strong style="color:#fff;">Sin este paso el pedido no se despacha.</strong>
            </p>
            <a href="${waLink}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 32px;border-radius:10px;letter-spacing:0.5px;">
              💬 Enviar ID al WhatsApp ahora
            </a>
            <p style="margin:14px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:3px;">#${orderId}</p>
          </td>
        </tr>

        <!-- Confirmación -->
        <tr>
          <td style="padding:32px 40px 0;text-align:center;">
            <p style="margin:0 0 6px;font-size:28px;">✅</p>
            <h1 style="margin:0;font-size:24px;color:#1a0f0a;font-weight:800;">¡Tu pedido está confirmado!</h1>
            <p style="margin:10px 0 0;font-size:15px;color:#7a6055;line-height:1.6;">
              Hola ${data.customerName.split(" ")[0]}, gracias por tu compra en C427.<br>Estamos preparando tu pedido con mucho cuidado.
            </p>
          </td>
        </tr>

        <!-- Número de pedido -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#faf6f1;border:2px solid #936c43;border-radius:12px;padding:14px 20px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#936c43;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Número de pedido</p>
              <p style="margin:4px 0 0;font-size:24px;font-weight:900;color:#936c43;letter-spacing:3px;">#${orderId}</p>
            </div>
          </td>
        </tr>

        <!-- Detalle productos -->
        <tr>
          <td style="padding:24px 40px 0;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#936c43;">Detalle del pedido</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr style="background:#faf6f1;">
                  <th style="text-align:left;font-size:11px;color:#936c43;font-weight:700;padding:8px 0;border-bottom:2px solid #e8ddd4;text-transform:uppercase;letter-spacing:1px;">Producto</th>
                  <th style="text-align:center;font-size:11px;color:#936c43;font-weight:700;padding:8px 0;border-bottom:2px solid #e8ddd4;text-transform:uppercase;letter-spacing:1px;">Cant.</th>
                  <th style="text-align:right;font-size:11px;color:#936c43;font-weight:700;padding:8px 0;border-bottom:2px solid #e8ddd4;text-transform:uppercase;letter-spacing:1px;">Precio</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:2px solid #936c43;padding-top:12px;">
              <tr>
                <td style="font-size:16px;font-weight:800;color:#1a0f0a;padding-top:12px;">Total</td>
                <td style="text-align:right;font-size:24px;font-weight:900;color:#936c43;padding-top:12px;">$${data.total.toLocaleString("es-AR")}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Envío -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#faf6f1;border-left:4px solid #936c43;border-radius:0 10px 10px 0;padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#936c43;">📦 Envío a domicilio</p>
              <p style="margin:0;font-size:14px;color:#3d2b1f;line-height:1.6;">${data.shipping.address ? `${data.shipping.address}, ${data.shipping.city}` : ""}</p>
              <p style="margin:6px 0 0;font-size:13px;color:#7a6055;">Te contactamos al <strong>${data.shipping.phone || ""}</strong> para coordinar la entrega.</p>
            </div>
          </td>
        </tr>

        <!-- Próximos pasos -->
        <tr>
          <td style="padding:20px 40px 0;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1a0f0a;">¿Qué pasa ahora?</p>
            <p style="margin:0;font-size:13px;color:#7a6055;line-height:2;">
              📞 Te contactamos en 24–48 hs para coordinar la entrega<br>
              🚚 Tu pedido llega en 3–5 días hábiles
            </p>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 40px 0;text-align:center;">
            <a href="https://c427.com.ar/productos" style="display:inline-block;background:#936c43;color:#fff;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:14px 36px;border-radius:10px;">Ver más productos</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px 32px;text-align:center;margin-top:24px;">
            <p style="margin:0;font-size:11px;color:#b0a090;">© 2025 C427 Medicina Estética · Banfield, Buenos Aires</p>
            <p style="margin:4px 0 0;font-size:11px;color:#936c43;">c427.com.ar</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Email de notificación a Nico ────────────────────────────────────────────

function buildNotificationEmail(data: EmailOrderData): string {
  const itemList = data.items
    .map((i) => `• ${i.name} x${i.quantity} — $${(i.price * i.quantity).toLocaleString("es-AR")}`)
    .join("<br>")

  return `
<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f9f9f9;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e5e5e5;">
    <h2 style="margin:0 0 4px;font-size:22px;color:#1a1a1a;">🛒 Nuevo pedido web</h2>
    <p style="margin:0 0 20px;color:#666;font-size:13px;">C427 Ecommerce · ${new Date().toLocaleString("es-AR")}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Pedido</span><br>
        <strong style="color:#936c43;font-size:16px;">#${data.orderId.slice(0, 8).toUpperCase()}</strong>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Cliente</span><br>
        <strong>${data.customerName}</strong>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Teléfono</span><br>
        <strong>${data.shipping.phone || "—"}</strong>
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Dirección</span><br>
        ${data.shipping.address || "—"}, ${data.shipping.city || ""}
      </td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Productos</span><br>
        <span style="line-height:1.8;">${itemList}</span>
      </td></tr>
      <tr><td style="padding:12px 0;">
        <span style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Total</span><br>
        <strong style="font-size:24px;color:#936c43;">$${data.total.toLocaleString("es-AR")}</strong>
      </td></tr>
    </table>
  </div>
</body>
</html>`
}

// ─── Funciones exportadas ─────────────────────────────────────────────────────

export async function sendOrderConfirmation(data: EmailOrderData) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const resend = getResend()
    await resend.emails.send({
      from: "C427 Medicina Estética <pedidos@c427.com.ar>",
      to: data.customerEmail,
      subject: `✅ Pedido confirmado #${data.orderId.slice(0, 8).toUpperCase()} — C427`,
      html: buildConfirmationEmail(data),
    })
  } catch (err) {
    console.error("Error enviando email de confirmación:", err)
  }
}

export async function sendOrderNotificationToNico(data: EmailOrderData) {
  const nicoEmail = process.env.NICO_EMAIL
  if (!process.env.RESEND_API_KEY || !nicoEmail) return
  try {
    const resend = getResend()
    await resend.emails.send({
      from: "C427 Web <onboarding@resend.dev>",
      to: nicoEmail,
      subject: `🛒 Nuevo pedido web — ${data.customerName} — $${data.total.toLocaleString("es-AR")}`,
      html: buildNotificationEmail(data),
    })
  } catch (err) {
    console.error("Error enviando notificación a Nico:", err)
  }
}
