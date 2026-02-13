import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image" // Faltaba este import
import { Mail } from "lucide-react"

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/c427logodorado.png"
              alt="C427 Logo"
              width={120}
              height={40}
              priority
            />
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
  )
}