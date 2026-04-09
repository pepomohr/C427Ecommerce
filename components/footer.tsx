import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Instagram, Mail, Clock, Truck, ShieldCheck, HeadphonesIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 pt-12">
      <div className="container px-4 md:px-6">
        {/* Benefits Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-border/40">
          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider">Envío Rápido</h4>
              <p className="text-xs text-muted-foreground">Envíos a todo el país</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider">Pago Seguro</h4>
              <p className="text-xs text-muted-foreground">Mercado Pago & Transferencia</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <HeadphonesIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider">Atención Personalizada</h4>
              <p className="text-xs text-muted-foreground">Asesoramiento profesional</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-12">
          {/* Brand & Newsletter */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-6 block">
              <Image
                src="/c427logodorado.png"
                alt="C427 Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cada piel es única y te enseñamos a cuidarla como se merece.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg text-primary mb-6">Explorar</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="h-1 w-1 bg-primary rounded-full"></span>
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/productos" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="h-1 w-1 bg-primary rounded-full"></span>
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/diagnostico" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="h-1 w-1 bg-primary rounded-full"></span>
                  Diagnóstico
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="h-1 w-1 bg-primary rounded-full"></span>
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h4 className="text-lg text-primary mb-6"></h4>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground"></p>
                  <p className="text-xs"></p>
                  <p className="text-xs"></p>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <a href="mailto:consultorioc427@gmail.com" className="text-xs hover:text-primary transition-colors">
                    consultorioc427@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <a 
                  href="https://www.instagram.com/medicinaestetica.ok/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://wa.me/5491160352289" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c-.003 1.396.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 pb-12 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} C427 - Medicina Estética. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/terminos" className="hover:text-primary transition-colors">Términos y Condiciones</Link>
            <Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
