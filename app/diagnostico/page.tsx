"use client" // <--- ¡Importante! Permite usar useState

import { SkinQuiz } from "@/components/skin-quiz"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { useState } from "react" // Importamos useState

export default function DiagnosticoPage() {
  const [isQuizComplete, setIsQuizComplete] = useState(false); // Nuevo estado

  return (
    <> 
      <Header /> 

      <div className="container mx-auto py-10 px-4 flex flex-col min-h-[80vh]">
        
        {/* Botón Volver (Alineado a la izquierda) */}
        <div className="w-full mb-6">
          <Button 
            variant="outline" 
            asChild 
            className="gap-2 shadow-sm hover:bg-primary/10 transition-all"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>

        {/* Título de Introducción (Se esconde cuando el quiz termina) */}
        {!isQuizComplete && (
            <div className="mb-8 text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold mb-4 text-primary">Descubrí tu Rutina Ideal</h1>
              <p className="text-muted-foreground text-lg">
                Respondé unas breves preguntas y nuestra IA te recomendará 
                los productos perfectos para tu piel.
              </p>
            </div>
        )}
        
        {/* El Quiz Componente, ahora con un callback */}
        <SkinQuiz onQuizComplete={setIsQuizComplete} /> 
      </div>
    </>
  )
}