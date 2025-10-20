"use client"

import Image from "next/image"
import Link from "next/link"
import { User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartIcon } from "@/components/cart-icon"

interface HeaderProps {
  isAuthenticated?: boolean
  isAdmin?: boolean
}

export function Header({ isAuthenticated = false, isAdmin = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/c427logodorado.png"
            alt="C427 Logo"
            width={100}
            height={10}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/productos" className="text-sm font-medium transition-colors hover:text-primary">
            Productos
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <CartIcon />
          <Link href={isAuthenticated ? "/perfil" : "/auth/login"}>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Cuenta de usuario</span>
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium transition-colors hover:text-primary">
                  Inicio
                </Link>
                <Link href="/productos" className="text-lg font-medium transition-colors hover:text-primary">
                  Productos
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-lg font-medium transition-colors hover:text-primary">
                    Admin
                  </Link>
                )}
                <Link href="/carrito" className="text-lg font-medium transition-colors hover:text-primary">
                  Carrito
                </Link>
                <Link
                  href={isAuthenticated ? "/perfil" : "/auth/login"}
                  className="text-lg font-medium transition-colors hover:text-primary"
                >
                  {isAuthenticated ? "Mi Perfil" : "Iniciar Sesión"}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
