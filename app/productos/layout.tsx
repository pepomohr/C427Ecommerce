import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tienda de Dermocosméticos | C427 Medicina Estética",
  description:
    "Explorá nuestra selección de productos dermocosméticos, serums, contornos de ojos y tratamientos faciales con respaldo médico. Envíos a toda Argentina.",
  alternates: {
    canonical: "/productos",
  },
  openGraph: {
    title: "Tienda | C427 Medicina Estética",
    description:
      "Dermocosméticos de alta calidad seleccionados por profesionales de la medicina estética.",
    url: "https://c427.com.ar/productos",
    images: [
      {
        url: "/c427logodorado.png",
        width: 1200,
        height: 630,
        alt: "Tienda C427 - Dermocosméticos",
      },
    ],
  },
}

export default function ProductosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
