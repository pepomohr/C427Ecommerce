"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"

declare global {
  interface Window {
    MercadoPago: any
  }
}

interface Props {
  items: any[]
  shipping: any
  userId: string
  email: string
  total: number
  onSuccess: (orderId: string) => void
  onError: (msg: string) => void
}

export function CardPaymentForm({ items, shipping, userId, email, total, onSuccess, onError }: Props) {
  const [isReady, setIsReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<any>(null)

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    if (!publicKey) {
      setError("Clave pública de Mercado Pago no configurada (NEXT_PUBLIC_MP_PUBLIC_KEY).")
      return
    }
    const script = document.createElement("script")
    script.src = "https://sdk.mercadopago.com/js/v2"
    script.async = true
    script.onload = () => initMP(publicKey)
    script.onerror = () => setError("No se pudo cargar el SDK de Mercado Pago. Verificá tu conexión.")
    document.body.appendChild(script)
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  function initMP(publicKey: string) {
    try {
    const mp = new window.MercadoPago(publicKey, { locale: "es-AR" })
    const cardForm = mp.cardForm({
      amount: String(total),
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número de tarjeta" },
        expirationDate: { id: "form-checkout__expirationDate", placeholder: "MM/YY" },
        securityCode: { id: "form-checkout__securityCode", placeholder: "Código de seguridad" },
        cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nombre como figura en la tarjeta" },
        issuer: { id: "form-checkout__issuer", placeholder: "Banco emisor" },
        installments: { id: "form-checkout__installments", placeholder: "Cuotas" },
        identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
        identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número de documento" },
        cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "Email" },
      },
      callbacks: {
        onFormMounted: (err: any) => { if (!err) setIsReady(true) },
        onSubmit: async (event: any) => {
          event.preventDefault()
          setIsProcessing(true)
          setError(null)
          const { paymentMethodId, issuerId, cardholderEmail, token, installments, identificationType, identificationNumber } = cardForm.getCardFormData()
          try {
            const res = await fetch("/api/mp/process-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token, installments, paymentMethodId, issuerId,
                identificationType, identificationNumber,
                items, shipping, userId,
                email: cardholderEmail || email,
              }),
            })
            const data = await res.json()
            if (data.status === "approved") {
              onSuccess(data.order_id)
            } else if (data.status === "pending") {
              onSuccess(data.order_id)
            } else {
              setError(data.error ?? "El pago fue rechazado. Verificá los datos.")
              setIsProcessing(false)
            }
          } catch {
            setError("Error de conexión. Intentá de nuevo.")
            setIsProcessing(false)
          }
        },
        onFetching: (resource: any) => {
          const progressBar = document.querySelector(".progress-bar")
          if (progressBar) progressBar.removeAttribute("value")
          return () => { if (progressBar) progressBar.setAttribute("value", "0") }
        },
      },
    })
    formRef.current = cardForm
    } catch (e: any) {
      setError("Error al inicializar el formulario de pago: " + (e?.message ?? "error desconocido"))
    }
  }

  return (
    <form id="form-checkout" className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <div className="h-11 border rounded-md bg-white px-3 flex items-center">
          <div id="form-checkout__cardNumber" className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 border rounded-md bg-white px-3 flex items-center">
            <div id="form-checkout__expirationDate" className="w-full" />
          </div>
          <div className="h-11 border rounded-md bg-white px-3 flex items-center">
            <div id="form-checkout__securityCode" className="w-full" />
          </div>
        </div>
        <input
          id="form-checkout__cardholderName"
          className="h-11 border rounded-md px-3 text-sm w-full"
          placeholder="Nombre en la tarjeta"
        />
        <select id="form-checkout__issuer" className="h-11 border rounded-md px-3 text-sm w-full bg-white" />
        <select id="form-checkout__installments" className="h-11 border rounded-md px-3 text-sm w-full bg-white" />
        <div className="grid grid-cols-2 gap-3">
          <select id="form-checkout__identificationType" className="h-11 border rounded-md px-3 text-sm w-full bg-white" />
          <input
            id="form-checkout__identificationNumber"
            className="h-11 border rounded-md px-3 text-sm w-full"
            placeholder="Número de documento"
          />
        </div>
        <input
          id="form-checkout__cardholderEmail"
          type="email"
          className="h-11 border rounded-md px-3 text-sm w-full"
          placeholder="Email"
          defaultValue={email}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        id="form-checkout__submit"
        className="w-full py-6 font-bold"
        disabled={!isReady || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando pago...
          </div>
        ) : isReady ? (
          `Pagar $${total.toLocaleString("es-AR")}`
        ) : (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando formulario...
          </div>
        )}
      </Button>
    </form>
  )
}
