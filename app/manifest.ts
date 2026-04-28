import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "C427 Medicina Estética",
    short_name: "C427",
    description: "Tienda de dermocosméticos y productos de medicina estética",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#936c43",
    orientation: "portrait",
    icons: [
      {
        src: "/logoandroidweb.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logoandroidweb.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
