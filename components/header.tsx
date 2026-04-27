"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { User, Menu, Search, ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { CartIcon } from "@/components/cart-icon"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

interface HeaderProps {
  isAuthenticated?: boolean
  isAdmin?: boolean
}

const productCategories = [
  {
    title: "Cuidado Facial",
    description: "Sérums, Antiedad, Limpieza, Acné y Rosácea",
    links: [
      { name: "Sérums", href: "/productos?tag=serums" },
      { name: "Antiedad", href: "/productos?tag=antiedad" },
      { name: "Limpieza", href: "/productos?tag=limpieza" },
      { name: "Acné", href: "/productos?tag=acne" },
      { name: "Rosácea", href: "/productos?tag=rosacea" },
    ]
  },
  {
    title: "Cuidado Corporal",
    description: "Hidratación, Celulitis y Cuidado Íntimo",
    links: [
      { name: "Hidratación", href: "/productos?tag=corporal" },
      { name: "Celulitis", href: "/productos?tag=celulitis" },
      { name: "Cuidado Íntimo", href: "/productos?tag=cuidado-intimo" },
    ]
  },
  {
    title: "Tipos de Piel",
    description: "Encontrá lo ideal para tu Biotipo Cutáneo",
    links: [
      { name: "Piel Seca", href: "/productos?tag=piel-seca" },
      { name: "Piel Grasa", href: "/productos?tag=piel-grasa" },
      { name: "Piel Mixta", href: "/productos?tag=piel-mixta" },
      { name: "Piel Sensible", href: "/productos?tag=piel-sensible" },
    ]
  }
]

// Componente de categoría desplegable para el menú móvil
function MobileCategory({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-primary/10 pb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pl-3 pb-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary py-1.5 transition-colors"
            >
              <ChevronRight className="h-3 w-3 shrink-0" />
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Header({ isAuthenticated, isAdmin }: HeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      router.push(`/productos?q=${encodeURIComponent(searchValue.trim())}`)
    } else {
      router.push("/productos")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      {/* Banner Promo */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-[10px] md:text-sm font-medium tracking-wide">
        10% de descuento en toda la web abonando por transferencia (válido todo el mes de abril)
      </div>

      {/* Main Header Row */}
      <div className="container flex h-16 md:h-24 items-center justify-between px-4 md:px-6 text-black">
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* ====== MENÚ HAMBURGUESA PREMIUM ====== */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 hover:bg-primary/10">
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col w-[300px] p-0 overflow-hidden bg-background">
              {/* Header del menú */}
              <div className="bg-primary px-6 py-8">
                <Image
                  src="/c427logodorado.png"
                  alt="C427 Logo"
                  width={120}
                  height={40}
                  className="object-contain brightness-0 invert"
                />
              </div>

              <SheetHeader className="sr-only">
                <SheetTitle>Menú de Navegación</SheetTitle>
                <SheetDescription>Navegación principal de C427</SheetDescription>
              </SheetHeader>

              {/* Nav links */}
              <nav className="flex flex-col flex-1 overflow-y-auto px-5 py-4 gap-1">

                {/* Catálogo directo */}
                <Link
                  href="/productos"
                  className="flex items-center gap-3 py-3 text-base font-semibold border-b border-border/40 hover:text-primary transition-colors"
                >
                  Ver Catálogo
                </Link>

                {/* Categorías desplegables */}
                <div className="pt-3 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                    Categorías
                  </p>
                  <div className="flex flex-col gap-1">
                    {productCategories.map((cat) => (
                      <MobileCategory key={cat.title} title={cat.title} links={cat.links} />
                    ))}
                  </div>
                </div>

                {/* CTAs al pie */}
                <div className="mt-auto pt-4 flex flex-col gap-3">
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 w-full bg-muted text-foreground rounded-xl py-3 px-4 font-bold text-sm tracking-wide hover:bg-muted/80 transition-all"
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/diagnostico"
                    className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-xl py-3 px-4 font-bold text-sm tracking-wide hover:bg-primary/90 transition-all shadow-md"
                  >
                    Test de Diagnóstico
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo — izquierda en móvil y desktop */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/c427logodorado.png"
              alt="C427 Logo"
              width={200}
              height={65}
              className="object-contain w-[110px] h-[36px] md:w-[180px] md:h-[60px]"
              priority
            />
          </Link>
        </div>

        {/* Buscador Desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative mx-auto">
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-full bg-muted/30 border-muted-foreground/30 pr-10 h-10 text-sm text-black"
          />
          <button type="submit" className="absolute right-1 top-1 h-8 w-8 text-primary flex items-center justify-center rounded-full">
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Acciones */}
        <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <Link href={isAuthenticated ? "/perfil" : "/auth/login"}>
            <Button variant="ghost" className="rounded-full h-9 md:h-12 text-black">
              <User className="h-5 w-5 md:h-6 md:w-6" />
              <span className="hidden lg:inline ml-2 text-sm font-medium">{isAuthenticated ? "Mi Perfil" : "Ingresar"}</span>
            </Button>
          </Link>
          <CartIcon />
        </div>
      </div>

      {/* Buscador Mobile */}
      <div className="md:hidden px-4 pb-3 pt-1">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-9 rounded-full bg-muted/50 border-none pr-10 text-xs text-black"
          />
          <button type="submit" className="absolute right-1 top-1 h-7 w-7 text-muted-foreground flex items-center justify-center">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Nav Secundaria Desktop */}
      <div className="hidden md:flex border-t border-border/40 bg-background w-full h-12 items-center px-6">
        <div className="container flex justify-center items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} font-bold h-9 px-4 text-xs uppercase text-black`}>
                  <Link href="/productos">Catálogo</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {productCategories.map((category) => (
                <NavigationMenuItem key={category.title}>
                  <NavigationMenuTrigger className="bg-transparent font-medium h-9 px-4 text-xs text-black">
                    {category.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] bg-white p-6 rounded-b-xl shadow-2xl text-black">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">{category.title}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.links.map((link) => (
                          <Link key={link.name} href={link.href} className="text-xs p-2 hover:text-primary transition-colors border-b border-muted flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 text-primary/50" />
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              {/* Diagnóstico destacado */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} bg-primary/10 text-primary font-bold h-9 px-4 text-xs rounded-full hover:bg-primary hover:text-white transition-all uppercase`}>
                  <Link href="/diagnostico">Diagnóstico</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  )
}