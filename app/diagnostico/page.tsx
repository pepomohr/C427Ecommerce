import { SkinQuiz } from "@/components/skin-quiz"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header" // <--- 1. Importamos el Header

export default async function DiagnosticoPage() {
  // NOTA: Acá idealmente tendríamos que chequear la sesión con Supabase 
  // para pasarle isAuthenticated={true} al Header, pero para que se vea visualmente
  // ya mismo, lo ponemos así directo.

  return (
    <> 
      {/* 2. Ponemos el Header afuera del contenedor para que ocupe todo el ancho */}
      <Header /> 

      <div className="container mx-auto py-10 px-4 flex flex-col min-h-[80vh]">
        
        {/* Botón Volver */}
        <div className="w-full mb-6">
          <Button 
            variant="ghost" 
            asChild 
            className="gap-2 shadow-sm hover:bg-primary/10 transition-all"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Contenido del Quiz */}
        <div className="w-full max-w-lg mx-auto flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-primary">Descubrí tu Rutina Ideal</h1>
            <p className="text-muted-foreground text-lg">
              Respondé unas breves preguntas y te recomendaremos 
              los productos perfectos para tu piel.
            </p>
          </div>
          
          <SkinQuiz />
        </div>
      </div>
    </>
  )
}