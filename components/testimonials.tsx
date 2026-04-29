'use client'

import React from 'react'
import { Star, Quote } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  author_name: string
  rating: number
  comment: string
  created_at: string
}

interface TestimonialsProps {
  userDisplayName?: string | null
  userId?: string | null
}

const SEED_REVIEWS: Review[] = [
  { id: 's1', author_name: 'Valentina M.', rating: 5, comment: 'Los productos de C427 transformaron mi rutina de skincare. El Serum Vitamina C me dejó la piel luminosa en semanas. ¡Totalmente recomendable!', created_at: '' },
  { id: 's2', author_name: 'Lucía R.', rating: 5, comment: 'Compré el contorno de ojos y es increíble. La atención fue excelente y llegó súper rápido. Seguiré comprando sin dudas.', created_at: '' },
  { id: 's3', author_name: 'Camila S.', rating: 5, comment: 'Me hicieron un diagnóstico de piel personalizado y desde entonces uso los productos que me recomendaron. Mi piel nunca estuvo tan bien.', created_at: '' },
  { id: 's4', author_name: 'Sofía B.', rating: 4, comment: 'Muy buenos productos y envío rápido. El Óleo Edad de Oro es una maravilla para la piel seca. Muy satisfecha con mi compra.', created_at: '' },
  { id: 's5', author_name: 'Florencia P.', rating: 5, comment: 'El mejor consultorio de estética de la zona. Los resultados con el tratamiento de radiofrecuencia son visibles desde la primera sesión.', created_at: '' },
]

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = React.useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${star} estrellas`}
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              star <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function Testimonials({ userDisplayName, userId }: TestimonialsProps) {
  const [reviews, setReviews] = React.useState<Review[]>(SEED_REVIEWS)
  const [showForm, setShowForm] = React.useState(false)
  const [rating, setRating] = React.useState(5)
  const [comment, setComment] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const supabase = createClient()

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  )

  // Cargar reseñas de Supabase
  React.useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (data && data.length > 0) {
        setReviews([...data, ...SEED_REVIEWS])
      }
    }
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    const newReview: Omit<Review, 'id'> = {
      author_name: userDisplayName || 'Cliente',
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('reviews').insert(newReview).select().single()
    if (!error && data) {
      setReviews((prev) => [data, ...prev])
    } else {
      setReviews((prev) => [{ ...newReview, id: `local-${Date.now()}` }, ...prev])
    }
    setComment('')
    setRating(5)
    setSubmitting(false)
    setSubmitted(true)
    setShowForm(false)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="py-14 md:py-20 bg-[#fdfcfb] overflow-hidden">
      <div className="container px-4 md:px-6">
        {/* Título */}
        <div className="text-left mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight uppercase">
            Lo que dicen nuestras clientas
          </h2>
          <div className="w-12 h-1 bg-primary/20 mt-2 mb-3" />
          <p className="text-muted-foreground text-sm md:text-base">
            Experiencias reales de quienes confían en C427.
          </p>
        </div>

        {/* Carrusel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore – embla-carousel-autoplay version mismatch (runtime OK)
          plugins={[plugin.current]}
          className="w-full relative px-4 md:px-0"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="pl-4 basis-full md:basis-1/3">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-primary/10 h-full flex flex-col gap-3 transition-all duration-300 hover:border-primary/30">
                  <div className="flex justify-between items-start">
                    <StarRating value={review.rating} />
                    <Quote className="h-6 w-6 text-primary/10 shrink-0" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1 italic line-clamp-4">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-primary/5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
                      {review.author_name[0]}
                    </div>
                    <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                      {review.author_name}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-8 md:mt-0">
             {/* Desktop arrows beside the title or fixed positions */}
            <CarouselPrevious className="relative md:absolute static translate-y-0 md:-top-16 md:right-16 md:left-auto border-primary/20 text-primary hover:bg-primary hover:text-white" />
            <CarouselNext className="relative md:absolute static translate-y-0 md:-top-16 md:right-0 border-primary/20 text-primary hover:bg-primary hover:text-white" />
          </div>
        </Carousel>

        {/* CTA para dejar reseña */}
        <div className="mt-12 text-center">
          {submitted && (
            <p className="text-primary font-semibold mb-3 animate-in fade-in">
              ¡Gracias por tu reseña! ✨
            </p>
          )}

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-white border border-primary text-primary px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
            >
              <Star className="h-3.5 w-3.5" />
              {userDisplayName ? `Dejar mi reseña, ${userDisplayName.split(' ')[0]}` : 'Dejar una reseña'}
            </button>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="max-w-md mx-auto bg-white border border-primary/15 rounded-2xl p-6 shadow-md text-left space-y-4 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-primary uppercase tracking-widest text-xs">
                  Tu reseña{userDisplayName ? `, ${userDisplayName.split(' ')[0]}` : ''}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-[10px] text-muted-foreground uppercase hover:text-primary transition-colors font-bold"
                >
                  Cerrar
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Puntuación</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tu experiencia</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Contanos tu experiencia..."
                  className="w-full text-sm border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none text-gray-800 bg-gray-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="w-full bg-primary text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {submitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
