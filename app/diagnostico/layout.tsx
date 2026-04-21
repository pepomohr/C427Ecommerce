import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Diagnóstico de Piel Gratis | C427 Medicina Estética",
  description:
    "Realizá nuestro test diagnóstico de piel gratuito y recibí recomendaciones personalizadas de tratamientos y productos adaptados a tu tipo de piel.",
  alternates: {
    canonical: "/diagnostico",
  },
  openGraph: {
    title: "Diagnóstico de Piel Gratis | C427",
    description:
      "Descubrí qué productos y tratamientos son ideales para tu tipo de piel con nuestro diagnóstico personalizado.",
    url: "https://c427.com.ar/diagnostico",
    images: [
      {
        url: "/c427logodorado.png",
        width: 1200,
        height: 630,
        alt: "Diagnóstico de piel - C427 Medicina Estética",
      },
    ],
  },
}

export default function DiagnosticoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
