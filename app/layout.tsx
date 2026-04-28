import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "@/components/ui/toaster"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { WelcomeToast } from "@/components/welcome-toast"
import ChatIA from "@/components/chatia"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "C427 - Centro de Medicina Estética | Buenos Aires, Argentina",
    template: "%s | C427 Medicina Estética",
  },
  description:
    "C427 es un centro de medicina estética en Argentina. Tratamientos faciales, corporales y dermocosméticos de alta calidad con respaldo médico. Encontrá tus productos en nuestra tienda online.",
  keywords: [
    "medicina estética argentina",
    "centro estético buenos aires",
    "dermocosméticos",
    "tratamientos faciales",
    "skincare médico",
    "C427",
    "consultorio estético",
    "productos faciales argentina",
  ],
  authors: [{ name: "C427 Medicina Estética" }],
  creator: "C427",
  metadataBase: new URL("https://c427.com.ar"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://c427.com.ar",
    siteName: "C427 - Medicina Estética",
    title: "C427 - Centro de Medicina Estética | Argentina",
    description:
      "Centro de medicina estética con productos y tratamientos de alta calidad. Fusionamos excelencia médica con calidez personalizada.",
    images: [
      {
        url: "/c427logodorado.png",
        width: 1200,
        height: 630,
        alt: "C427 - Centro de Medicina Estética",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "C427 - Centro de Medicina Estética | Argentina",
    description:
      "Centro de medicina estética con productos y tratamientos de alta calidad.",
    images: ["/c427logodorado.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "XZo8a7k0UBg4FDtuByZ7b67UGB2nDv-QX6rPzYMzaKQ",
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  name: "C427 - Centro de Medicina Estética",
  url: "https://c427.com.ar",
  logo: "https://c427.com.ar/c427logodorado.png",
  image: "https://c427.com.ar/c427logodorado.png",
  description:
    "Centro de medicina estética en Argentina. Tratamientos faciales, corporales y dermocosméticos de alta calidad con respaldo médico.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AR",
    addressRegion: "Buenos Aires",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+54-11-6035-2289",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
  sameAs: ["https://www.instagram.com/c427_estetica/"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`font-sans ${inter.variable}`}>
        <CartProvider>
          <Suspense fallback={null}>{children}</Suspense>
          <Suspense fallback={null}><WelcomeToast /></Suspense>
          <Toaster />
          <ChatIA />
          <WhatsAppButton />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}