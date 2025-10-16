import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function ErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

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
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Ocurrió un Error</CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Código de error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                  Ocurrió un error inesperado. Por favor intenta nuevamente.
                </p>
              )}
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link href="/auth/login">Volver a Iniciar Sesión</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/">Ir al Inicio</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
