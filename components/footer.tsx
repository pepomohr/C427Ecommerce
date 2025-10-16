import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4" style={{ color: "oklch(0.65 0.15 85)" }}>
              C427
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Productos de alta calidad para el cuidado facial y corporal. Tu belleza es nuestra prioridad.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-muted-foreground hover:text-primary transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?category=Facial"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Facial
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?category=Corporal"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Corporal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: info@c427.com</li>
              <li>Tel: +54 11 1234-5678</li>
              <li>Buenos Aires, Argentina</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} C427. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
