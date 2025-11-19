"use client"

import { useState } from "react"
import Image from "next/image" // <--- Importamos Image
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, ArrowRight, RefreshCcw } from "lucide-react"

// ACÁ MAÑANA DEFINIMOS LOS PRODUCTOS REALES
const RUTINAS = {
  grasa: {
    titulo: "Rutina Control & Detox",
    descripcion: "Ideal para pieles que necesitan regular el brillo y limpiar poros.",
    productos: ["Limpiador Gel", "Serum Niacinamida"] 
  },
  seca: {
    titulo: "Rutina Hidratación Profunda",
    descripcion: "Para devolverle la elasticidad y el confort a tu piel.",
    productos: ["Leche de Limpieza", "Crema Ultra Hidratante"]
  },
  mixta: {
    titulo: "Rutina Balance Total",
    descripcion: "El equilibrio perfecto para cuidar zona T y mejillas.",
    productos: ["Emulsión de Limpieza", "Hidratante Ligera"]
  },
}

const PREGUNTAS = [
  {
    texto: "¿Cómo se siente tu piel unas horas después de lavarla?",
    opciones: [
      { texto: "Tirante o áspera", valor: "seca" },
      { texto: "Normal, sin cambios", valor: "mixta" },
      { texto: "Brillosa solo en frente o nariz", valor: "mixta" },
      { texto: "Brillosa en todo el rostro", valor: "grasa" },
      { texto: "Sensible o con enrojecimiento", valor: "seca" },
    ]
  },
  {
    texto: "¿Qué te gustaría mejorar de tu piel?",
    opciones: [
      { texto: "Aumentar hidratación", valor: "seca" },
      { texto: "Reducir brillo o granitos", valor: "grasa" },
      { texto: "Suavizar arrugas o flacidez", valor: "seca" },
      { texto: "Calmar sensibilidad o irritación", valor: "seca" },
      { texto: "Mejorar luminosidad", valor: "mixta" },
    ]
  },
  {
    texto: "¿En qué grupo de edad estás?",
    opciones: [
      { texto: "Menos de 25 años", valor: "grasa" },
      { texto: "25 a 35 años", valor: "mixta" },
      { texto: "36 a 45 años", valor: "mixta" },
      { texto: "46 a 55 años", valor: "seca" },
      { texto: "Más de 55 años", valor: "seca" },
    ]
  },
  {
    texto: "¿Con qué frecuencia usás protector solar?",
    opciones: [
      { texto: "Todos los días", valor: "mixta" },
      { texto: "Solo en verano o al sol", valor: "mixta" },
      { texto: "Casi nunca", valor: "mixta" },
    ]
  },
  {
    texto: "¿Cómo describirías tus hábitos diarios?",
    nota: "(Alimentación, descanso, estrés)",
    opciones: [
      { texto: "Bastante equilibrados", valor: "mixta" },
      { texto: "Regulares", valor: "mixta" },
      { texto: "Podrían mejorar bastante", valor: "mixta" },
    ]
  },
  {
    texto: "¿Cuántos pasos tiene tu rutina actual?",
    opciones: [
      { texto: "Ninguno / solo agua", valor: "mixta" },
      { texto: "2 o 3 pasos", valor: "mixta" },
      { texto: "Más de 3 pasos", valor: "mixta" },
    ]
  }
]

export function SkinQuiz() {
  const [step, setStep] = useState(0)
  const [puntos, setPuntos] = useState({ grasa: 0, seca: 0, mixta: 0 })
  const [resultado, setResultado] = useState<keyof typeof RUTINAS | null>(null)

  const responder = (valor: string) => {
    if (valor in puntos) {
       const key = valor as keyof typeof puntos
       setPuntos({ ...puntos, [key]: puntos[key] + 1 })
    }

    if (step < PREGUNTAS.length - 1) {
      setStep(step + 1)
    } else {
      const ganador = Object.keys(puntos).reduce((a, b) => 
        puntos[a as keyof typeof puntos] > puntos[b as keyof typeof puntos] ? a : b
      ) as keyof typeof RUTINAS
      setResultado(ganador || "mixta")
    }
  }

  const reiniciar = () => {
    setStep(0)
    setPuntos({ grasa: 0, seca: 0, mixta: 0 })
    setResultado(null)
  }

  if (resultado) {
    const r = RUTINAS[resultado]
    return (
      <Card className="w-full max-w-lg mx-auto border-primary shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center bg-primary/10 rounded-t-lg pb-8 pt-8 relative">
          <div className="mx-auto bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="w-7 h-7" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">¡Tu Diagnóstico!</CardTitle>
          <CardDescription className="text-lg mt-2">Basado en el análisis de tu perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-8 text-center px-8">
          <div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">{r.titulo}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{r.descripcion}</p>
          </div>
          
          <div className="bg-secondary/30 p-6 rounded-xl text-left border border-border/50">
            <p className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Recomendados para vos:
            </p>
            <ul className="space-y-3">
              {r.productos.map((p, i) => (
                <li key={i} className="flex items-center gap-3 bg-background p-3 rounded-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="font-medium">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-8 px-8">
          <Button asChild size="lg" className="w-full font-bold text-lg h-12 shadow-md hover:shadow-lg transition-all">
            <Link href="/productos">
              Ver Rutina Completa <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button variant="ghost" onClick={reiniciar} className="text-muted-foreground hover:text-foreground">
            <RefreshCcw className="mr-2 w-4 h-4" /> Volver a empezar
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        {/* CABECERA CON LOGO A LA DERECHA */}
        <div className="flex justify-between items-center">
            <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Test de Piel</span>
                <CardTitle className="text-2xl mt-1">Descubrí tu rutina</CardTitle>
            </div>
            {/* LOGO ACÁ */}
            <div className="relative w-30 h-30">
                 <Image 
                    src="/c427logodorado.png" 
                    alt="C427 Logo" 
                    fill
                    className="object-cover mt-1"
                 />
            </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div className="flex justify-between items-end text-sm text-muted-foreground mb-2">
            <span>Progreso</span>
            <span className="font-medium text-foreground">{step + 1} / {PREGUNTAS.length}</span>
        </div>
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 ease-out rounded-full" 
            style={{ width: `${((step + 1) / PREGUNTAS.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="grid gap-4 pt-6 pb-8">
        <div className="mb-2">
          <h3 className="text-xl font-medium leading-tight">{PREGUNTAS[step].texto}</h3>
          {PREGUNTAS[step].nota && (
            <p className="text-sm text-muted-foreground mt-1">{PREGUNTAS[step].nota}</p>
          )}
        </div>
        
        <div className="grid gap-3">
          {PREGUNTAS[step].opciones.map((opcion, i) => (
            <Button 
              key={i} 
              variant="outline" 
              className="h-auto py-4 px-6 justify-start text-left text-base hover:border-primary hover:bg-primary/5 transition-all shadow-sm group"
              onClick={() => responder(opcion.valor)}
            >
              <span className="w-full flex items-center justify-between">
                {opcion.texto}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}