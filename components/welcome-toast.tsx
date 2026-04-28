"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function WelcomeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const welcome = searchParams.get("welcome")
    if (!welcome) return

    const isNew = welcome === "new"

    toast({
      title: isNew ? "¡Ya sos parte de C427! 🎉" : "¡Bienvenido/a de vuelta! 👋",
      description: isNew
        ? "Podés arrancar a comprar desde la web."
        : "Qué bueno tenerte de vuelta en C427.",
      duration: 4000,
    })

    // Sacar el param de la URL sin recargar
    const params = new URLSearchParams(searchParams.toString())
    params.delete("welcome")
    const newUrl = params.toString() ? `${pathname}?${params}` : pathname
    router.replace(newUrl, { scroll: false })
  }, [])

  return null
}
