import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
           <Link href="/" className="flex items-center">
          <Image
            src="/c427logodorado.png"
            alt="C427 Logo"
            width={100}
            height={10}
            priority
          />
        </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cada piel es única y te enseñamos a cuidarla como se merece.
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
              <li>Email: consultorioc427@gmail.com</li>
              <li>Tel: +54 9 11 6035-2289</li>
              <li>Buenos Aires, Argentina</li>
              <li>Maipú 170, Banfield</li>
              <li><a className="text-primary hover:text-chart-2" href="https://www.instagram.com/medicinaestetica.ok/">Ir a Instagram</a></li>
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
