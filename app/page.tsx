import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile if authenticated
  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  // Get featured products (first 4 active products)
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .limit(4)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header isAuthenticated={!!user} isAdmin={profile?.role === "admin"} />

      <main className="flex-1">
        {/* 🌄 Hero Section con imagen de fondo */}
        <section
          className="relative overflow-hidden py-20 md:py-32 bg-cover bg-center"
          style={{ backgroundImage: "url('/background-fondo.jpg')" }} // 👈 poné tu imagen en /public
        >
          {/* Overlay oscuro para mejor contraste */}d
          <div className="absolute inset-0 bg-black/40" />

          <div className="container relative z-10 px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center text-white">
              <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
                Dónde la medicina se encuentra con la estetica
              </h1>
              <p className="text-lg md:text-xl mb-8 leading-relaxed text-pretty">
                En C427 no solo cuidamos tu piel en nuestros tratamientos, también te acompañamos en casa con los productos ideales para seguir mimándola.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-base">
                  <Link href="/productos">
                    Ver Productos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base bg-transparent text-white border-white hover:bg-white/10">
                  <Link href="/productos?category=Facial">Tratamientos Faciales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Calidad Premium</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Productos seleccionados con los mejores ingredientes
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Compra Segura</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Pagos protegidos con Mercado Pago</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-primary/10">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Envío Rápido</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Recibí tus productos en la puerta de tu casa
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Productos Destacados</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Descubre nuestra selección de tratamientos más populares
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                  <Link href="/productos">
                    Ver Todos los Productos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Categories CTA */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/productos?category=Facial"
                className="group relative overflow-hidden rounded-lg bg-primary/5 p-8 md:p-12 hover:bg-primary/10 transition-colors"
              >
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">Tratamientos Faciales</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Cuida tu rostro con nuestros productos especializados
                </p>
                <span className="inline-flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                  Explorar
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
              <Link
                href="/productos?category=Corporal"
                className="group relative overflow-hidden rounded-lg bg-accent/5 p-8 md:p-12 hover:bg-accent/10 transition-colors"
              >
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">Tratamientos Corporales</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Productos para el cuidado integral de tu cuerpo
                </p>
                <span
                  className="inline-flex items-center font-medium group-hover:gap-2 transition-all"
                  style={{ color: "oklch(0.65 0.15 85)" }}
                >
                  Explorar
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
