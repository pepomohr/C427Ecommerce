'use client'

import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function WhatsAppRedirect({ url }: { url: string }) {
  useEffect(() => {
    // Abre WhatsApp automáticamente al cargar la página de éxito
    // window.location.href funciona en móvil y desktop sin ser bloqueado
    const timer = setTimeout(() => {
      window.location.href = url
    }, 800)
    return () => clearTimeout(timer)
  }, [url])

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
