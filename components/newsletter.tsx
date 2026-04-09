"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [suscripto, setSuscripto] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSuscripto(true)
  }

  return (
    <section className="bg-secondary py-12 md:py-16 mt-4">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 max-w-5xl mx-auto">
          <div className="text-center md:text-left space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-muted uppercase tracking-tight">Suscribite para recibir nuevas ofertas</h2>
            <p className="text-muted/80 text-lg font-light">Unite a nuestra comunidad y cuidá tu piel con los mejores consejos.</p>
          </div>
          <div className="w-full md:max-w-md">
            {suscripto ? (
              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
                <div>
                  <p className="text-white font-bold text-base">¡Tu suscripción fue aprobada!</p>
                  <p className="text-muted/70 text-sm">Pronto recibirás nuestras mejores ofertas.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 p-1 bg-white/10 rounded-xl backdrop-blur-sm">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none text-white placeholder:text-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
                />
                <Button type="submit" className="bg-muted text-secondary hover:bg-muted/90 font-bold px-8 h-12 rounded-lg transition-all shrink-0">
                  SUSCRIBIRME
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
