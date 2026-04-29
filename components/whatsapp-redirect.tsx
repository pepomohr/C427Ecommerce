'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WhatsAppRedirect() {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const waUrl = sessionStorage.getItem('pendingWaUrl')
    if (waUrl) {
      sessionStorage.removeItem('pendingWaUrl')
      setUrl(waUrl)
      // Abre WhatsApp automáticamente — window.location.href no es bloqueado por navegadores
      setTimeout(() => {
        window.location.href = waUrl
      }, 600)
    }
  }, [])

  if (!url) return null

  return (
    <Button
      asChild
      className="w-full bg-[#25D366] hover:bg-[#20b558] text-white font-bold py-6 text-base shadow-lg"
    >
      <a href={url}>
        <MessageCircle className="h-5 w-5 mr-2" />
        Abrir WhatsApp con tu pedido
      </a>
    </Button>
  )
}
