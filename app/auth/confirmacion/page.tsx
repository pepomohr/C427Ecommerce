import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-b from-muted/50 to-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="text-center mb-4">
            <Link href="/">
              <span className="text-4xl font-serif font-bold tracking-tight" style={{ color: "oklch(0.65 0.15 85)" }}>
                C427
              </span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Confirma tu Email</CardTitle>
              <CardDescription className="text-center">Te hemos enviado un email de confirmación</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                Por favor revisa tu bandeja de entrada y haz click en el enlace de confirmación para activar tu cuenta.
                Si no ves el email, revisa tu carpeta de spam.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Ir a Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
