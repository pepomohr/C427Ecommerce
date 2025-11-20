"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation" 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, ArrowRight, RefreshCcw } from "lucide-react"
import { useCart } from "@/lib/cart-context" 
import { useToast } from "@/components/ui/use-toast" 
import { getProductsForQuiz } from '@/lib/actions/product-actions'; // Server Action

// --- Tipado y Constantes ---
interface ProductDetail {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
}

interface SkinQuizProps {
    onQuizComplete: (isComplete: boolean) => void;
}


// 1. CONSTANTE DE RUTINAS (CON ID Y NOMBRE LIMPIO)
const RUTINAS = {
  "seca_sensible": {
    "titulo": "Rutina CONFORT y Reparación",
    "descripcion": "Para pieles secas, sensibles y/o deshidratadas. Aporta elasticidad, calma y reduce el enrojecimiento.",
    "productos": [
      { name: "Espuma de Limpieza Sulderm", id: "572e96e6-64db-4a56-a3ae-b24e140e8e59" },
      { name: "Serum Hyaluronic Filler Sulderm", id: "ce9476c8-5bf4-40b3-b623-3ec07afd47bf" },
      { name: "Hydra Filler Intense Sulderm", id: "4aa7a511-e2eb-494c-ad8b-53e0271c2681" },
      { name: "Ultra Defense Sulderm", id: "29d64f13-71d0-40b3-9ab6-9711e386f5e1" }
    ]
  },
  "seborreica_acne": {
    "titulo": "Rutina CONTROL & PURIFICANTE",
    "descripcion": "Regula el sebo, previene el acné y mejora la textura sin resecar.",
    "productos": [
      { name: "Acneplur Foam Sulderm", id: "a6c7b5e1-487c-424d-aaa0-736b6ba863b1" },
      { name: "Acneplur Hydra Sulderm", id: "76176f07-9e36-4bf1-b701-d23e21f33615" },
      { name: "Acid Formulations Serum NM Sulderm", id: "1e37a552-b389-4552-b45d-46c12ec9cb47" }
    ]
  },
  "madura_50": {
    "titulo": "Rutina ANTIAGE 50+ ORO",
    "descripcion": "Nutrición profunda para pieles maduras. Aporta vitalidad y rellena arrugas.",
    "productos": [
      { name: "Agua Micelar 3en1 Sulderm", id: "62d307f7-544f-424c-977a-36f6f24cfcb2" },
      { name: "Edad de oro Serum Sulderm", id: "32fbfd96-d7e1-4e7e-9394-dc97ba902e3a" },
      { name: "Edad de oro Hydra Age+ Sulderm", id: "5d401164-c311-4658-b17e-db60893e4c7f" },
      { name: "Crema Antiage 360° Sulderm", id: "b6f995b4-84c0-49ff-b043-bb26507805d5" }
    ]
  },
  "mas_40": {
    "titulo": "Rutina ANTIAGE 40+ PROFUNDA",
    "descripcion": "Rutina completa enfocada en suavizar arrugas, mejorar la firmeza y la hidratación.",
    "productos": [
      { name: "Espuma de Limpieza Sulderm", id: "572e96e6-64db-4a56-a3ae-b24e140e8e59" },
      { name: "Edad de oro Hydra Age+ Sulderm", id: "5d401164-c311-4658-b17e-db60893e4c7f" },
      { name: "Crema Antiage 360° Sulderm", id: "b6f995b4-84c0-49ff-b043-bb26507805d5" }
    ]
  },
  "mas_30": {
    "titulo": "Rutina BÁSICA 30+ PREVENTIVA",
    "descripcion": "Foco en la prevención y la defensa celular. Mantiene la piel joven y luminosa.",
    "productos": [
      { name: "Espuma de Limpieza Sulderm", id: "572e96e6-64db-4a56-a3ae-b24e140e8e59" },
      { name: "Serum Redensity Sulderm", id: "be5b1f6f-ed46-4bf2-876a-6b2182741c04" },
      { name: "Hydra Filler Lihgt Sulderm", id: "7981d8f9-4186-495e-948b-4c4727c7ee8c" },
      { name: "Ultra Defense Sulderm", id: "29d64f13-71d0-40b3-9ab6-9711e386f5e1" }
    ]
  },
  "mas_20": {
    "titulo": "Rutina SIMPLE 20+ DIARIA",
    "descripcion": "Rutina de inicio para pieles jóvenes que buscan hidratación y luminosidad.",
    "productos": [
      { name: "Espuma de Limpieza Sulderm", id: "572e96e6-64db-4a56-a3ae-b24e140e8e59" },
      { name: "Serum Hyaluronic Filler Sulderm", id: "ce9476c8-5bf4-40b3-b623-3ec07afd47bf" },
      { name: "Hydra Filler Lihgt Sulderm", id: "7981d8f9-4186-495e-948b-4c4727c7ee8c" },
      { name: "Acid Formulations Serum LG Sulderm", id: "b1e9e97d-4ff1-41e3-b85a-aa13ddaa15c1" }
    ]
  }
}

// 2. CONSTANTE DE PREGUNTAS
const PREGUNTAS = [
  {
    texto: "¿Cómo se siente tu piel unas horas después de lavarla?",
    opciones: [
      { texto: "Tirante o áspera", valor: "seca" },
      { texto: "Brillosa en todo el rostro", valor: "grasa" },
      { texto: "Sensible o con enrojecimiento", valor: "sensible" },
      { texto: "Normal, o brillo solo en frente/nariz", valor: "mixta" },
    ]
  },
  {
    texto: "¿Qué te gustaría mejorar de tu piel?",
    opciones: [
      { texto: "Reducir brillo o granitos", valor: "grasa" },
      { texto: "Aumentar hidratación", valor: "seca" },
      { texto: "Suavizar arrugas o flacidez", valor: "madura" },
      { texto: "Calmar sensibilidad o irritación", valor: "sensible" },
      { texto: "Mejorar luminosidad", valor: "mixta" },
    ]
  },
  {
    texto: "¿En qué grupo de edad estás?",
    opciones: [
      { texto: "Menos de 25 años", valor: "age_20" },
      { texto: "25 a 35 años", valor: "age_30" },
      { texto: "36 a 45 años", valor: "age_40" },
      { texto: "46 a 55 años", valor: "age_50" },
      { texto: "Más de 55 años", valor: "age_50" },
    ]
  },
  {
    texto: "¿Con qué frecuencia usás protector solar?",
    opciones: [
      { texto: "Todos los días", valor: "neutral" },
      { texto: "Solo en verano o al sol", valor: "neutral" },
      { texto: "Casi nunca", valor: "neutral" },
    ]
  },
  {
    texto: "¿Cómo describirías tus hábitos diarios?",
    nota: "(Alimentación, descanso, estrés)",
    opciones: [
      { texto: "Bastante equilibrados", valor: "neutral" },
      { texto: "Regulares", valor: "neutral" },
      { texto: "Podrían mejorar bastante", valor: "neutral" },
    ]
  },
  {
    texto: "¿Cuántos pasos tiene tu rutina actual?",
    opciones: [
      { texto: "Ninguno / solo agua", valor: "neutral" },
      { texto: "2 o 3 pasos", valor: "neutral" },
      { texto: "Más de 3 pasos", valor: "neutral" },
    ]
  }
]


// 3. LÓGICA DE CÁLCULO
const calcularResultadoFinal = (puntos: Record<string, number>, edad: string): keyof typeof RUTINAS => {
  const condiciones = { grasa: puntos.grasa, seca: puntos.seca, sensible: puntos.sensible };
  const maxCondicion = Object.keys(condiciones).reduce((a, b) => condiciones[a as keyof typeof condiciones] > condiciones[b as keyof typeof condiciones] ? a : b);

  if (maxCondicion === 'grasa' && puntos.grasa >= 2) return 'seborreica_acne';
  if (maxCondicion === 'sensible' && puntos.sensible >= 1) return 'seca_sensible'; 
  if (maxCondicion === 'seca' && puntos.seca >= 2) return 'seca_sensible';

  if (edad === 'age_50') return 'madura_50';
  if (edad === 'age_40') return 'mas_40';
  if (edad === 'age_30') return 'mas_30';
  if (edad === 'age_20') return 'mas_20';

  return 'mas_20'; 
}


export function SkinQuiz({ onQuizComplete }: SkinQuizProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart() 
  
  const [pasoActual, setPasoActual] = useState(0)
  const [puntos, setPuntos] = useState({ grasa: 0, seca: 0, sensible: 0, madura: 0, mixta: 0, neutral: 0 })
  const [edadRespuesta, setEdadRespuesta] = useState('age_20')
  const [cargando, setCargando] = useState(false)

  const [resultadoKey, setResultadoKey] = useState<keyof typeof RUTINAS | null>(null); // Clave de la rutina
  const [productosConPrecio, setProductosConPrecio] = useState<ProductDetail[]>([]); // Productos con precio para el display
  const [totalPrice, setTotalPrice] = useState(0); // Precio total


  // FUNCIÓN 1: Se llama cuando termina el Quiz para buscar los precios
  const fetchAndDisplayResults = async (routineKey: keyof typeof RUTINAS) => {
    setCargando(true);
    setResultadoKey(routineKey); 
    onQuizComplete(true); // <--- AVISA AL PADRE QUE MUESTRE RESULTADO

    // 1. Extraemos los IDs para consultar
    const routineData = RUTINAS[routineKey];
    const productIds = routineData.productos.map(p => p.id);

    // 2. Llamada al servidor
    const productosCompletos: ProductDetail[] = await getProductsForQuiz(productIds) as ProductDetail[];

    if (productosCompletos.length === 0) {
      setCargando(false);
      toast({
        title: "Error de inventario",
        description: "No se encontraron los productos de la rutina. (Verificar IDs)",
        variant: "destructive",
      });
      // No devolvemos nada, solo mostramos el error
    }

    // 3. Calculamos el total y guardamos el array completo
    const total = productosCompletos.reduce((sum, p) => sum + p.price, 0);
    setProductosConPrecio(productosCompletos);
    setTotalPrice(total);
    setCargando(false);
  }


  // FUNCIÓN 2: Se llama cuando el usuario responde la última pregunta
  const responder = (valor: string) => {
    if (valor.startsWith('age_')) setEdadRespuesta(valor);
    if (valor in puntos) {
       const key = valor as keyof typeof puntos
       setPuntos(prev => ({ ...prev, [key]: prev[key] + 1 }))
    }

    if (pasoActual < PREGUNTAS.length - 1) {
      setPasoActual(pasoActual + 1)
    } else {
      const resultadoFinal = calcularResultadoFinal(puntos, edadRespuesta)
      fetchAndDisplayResults(resultadoFinal) 
    }
  }


  // FUNCIÓN 3: Se llama al apretar el botón final (Add to Cart)
  const handleAgregarRutina = async () => {
    if (productosConPrecio.length === 0) {
      toast({
        title: "No hay productos para agregar",
        description: "Intenta de nuevo o contacta a soporte.",
        variant: "destructive",
      });
      return;
    }
    
    // 1. Agregar uno por uno al carrito (usamos el array ya calculado)
    productosConPrecio.forEach(product => {
      addItem(product as any, 1) 
    });

    // 2. Notificación y redirección
    toast({
      title: "Rutina agregada!",
      description: `Se agregaron ${productosConPrecio.length} productos a tu carrito.`,
    });
    
    router.push('/carrito')
  }


  const reiniciar = () => {
    setPasoActual(0)
    setPuntos({ grasa: 0, seca: 0, sensible: 0, madura: 0, mixta: 0, neutral: 0 })
    setEdadRespuesta('age_20')
    setResultadoKey(null)
    setProductosConPrecio([])
    setTotalPrice(0);
    onQuizComplete(false); // AVISA AL PADRE QUE EL QUIZ REINICIÓ
  }


  // --- JSX (Renderizado) ---
  if (resultadoKey) {
    const r = RUTINAS[resultadoKey]
    
    // Vista de carga si estamos esperando los precios del servidor
    if (cargando) {
      return (
        <Card className="w-full max-w-lg mx-auto shadow-xl border-t-4 border-t-primary h-64 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold mb-4">Calculando tu rutina...</span>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </Card>
      );
    }

    // Vista final con precios (CORREGIDA)
    return (
      <Card className="w-full max-w-lg mx-auto border-primary shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center bg-primary/10 rounded-t-lg pb-8 pt-8 relative">
          {/* Restauración del Header */}
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
              <Sparkles className="w-4 h-4" /> RECOMENDADOS PARA VOS:
            </p>
            <ul className="space-y-3">
              {/* RENDERIZADO DE PRODUCTOS FINALES (Con el nombre y el precio) */}
              {productosConPrecio.map((prod) => (
                <li key={prod.id} className="flex items-center justify-between bg-background p-3 rounded-md shadow-sm">
                    <span className="font-medium">{prod.name}</span> 
                    <span className="font-semibold text-primary/80">${prod.price.toLocaleString('es-AR')}</span> 
                </li>
              ))}
            </ul>
          </div>
          
          {/* BLOQUE DE PRECIO TOTAL (EL TOQUE FINAL) */}
          <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <span className="text-xl font-bold">Total de la Rutina:</span>
              <span className="text-2xl font-extrabold text-primary">${totalPrice.toLocaleString('es-AR')}</span>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-4 pb-8 px-8">
          <Button 
            size="lg" 
            className="w-full font-bold text-lg h-12 shadow-md hover:shadow-lg transition-all"
            onClick={handleAgregarRutina} 
            disabled={cargando || productosConPrecio.length === 0}
          >
            {productosConPrecio.length > 0 ? `Agregar ${productosConPrecio.length} Productos al Carrito` : 'Productos no disponibles'}
          </Button>
          <Button variant="ghost" onClick={reiniciar} className="text-muted-foreground hover:text-foreground">
            <RefreshCcw className="mr-2 w-4 h-4" /> Volver a empezar
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Vista de preguntas
  const pregunta = PREGUNTAS[pasoActual]

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-4">
            <div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Test de Piel</span>
                <CardTitle className="text-2xl mt-1">Descubrí tu rutina</CardTitle>
            </div>
            <div className="relative w-30 h-30">
                 <Image 
                    src="/c427logodorado.png" 
                    alt="C427 Logo" 
                    fill
                    className="object-contain"
                 />
            </div>
        </div>

        <div className="flex justify-between items-end text-sm text-muted-foreground mb-2">
            <span>Progreso</span>
            <span className="font-medium text-foreground">{pasoActual + 1} / {PREGUNTAS.length}</span>
        </div>
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 ease-out rounded-full" 
            style={{ width: `${((pasoActual + 1) / PREGUNTAS.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="grid gap-4 pt-6 pb-8">
        <div className="mb-2">
          <h3 className="text-xl font-medium leading-tight">{pregunta.texto}</h3>
          {pregunta.nota && (
            <p className="text-sm text-muted-foreground mt-1">{pregunta.nota}</p>
          )}
        </div>
        
        <div className="grid gap-3">
          {pregunta.opciones.map((opcion, i) => (
            <Button 
              key={i} 
              variant="outline" 
              className="h-auto py-4 px-6 justify-start text-left text-base hover:text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm group"
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