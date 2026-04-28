/**
 * MIGRACIÓN DE IMÁGENES — E-commerce → Sistema C427
 * ===================================================
 * Las imágenes del Storage del e-commerce son públicas,
 * así que solo necesitás la Service Role Key del SISTEMA.
 *
 * CÓMO USAR (una sola vez):
 *   1. Abrí terminal en la carpeta del ecommerce
 *   2. set SISTEMA_SERVICE_ROLE_KEY=eyJhbGci...la del proyecto hwkhcwdqicgnvitlcmwr
 *   3. node scripts/migrate-images-to-sistema.mjs
 */

import { createClient } from "@supabase/supabase-js"

const SISTEMA_URL = "https://hwkhcwdqicgnvitlcmwr.supabase.co"
const SISTEMA_KEY = process.env.SISTEMA_SERVICE_ROLE_KEY

if (!SISTEMA_KEY) {
  console.error("")
  console.error("❌  Falta SISTEMA_SERVICE_ROLE_KEY")
  console.error("    Corré primero:")
  console.error('    set SISTEMA_SERVICE_ROLE_KEY=eyJhbGci...')
  console.error("")
  process.exit(1)
}

const sistema = createClient(SISTEMA_URL, SISTEMA_KEY)

async function ensureBucket() {
  const { data: buckets } = await sistema.storage.listBuckets()
  const exists = buckets?.some(b => b.name === "products")
  if (!exists) {
    const { error } = await sistema.storage.createBucket("products", { public: true })
    if (error) throw new Error(`No se pudo crear el bucket: ${error.message}`)
    console.log('✅  Bucket "products" creado en Sistema')
  }
}

async function run() {
  await ensureBucket()

  // Buscar productos en Sistema cuyo image_url apunta al Storage del e-commerce
  const { data: products, error } = await sistema
    .from("products")
    .select("id, name, image_url")
    .not("image_url", "is", null)
    .ilike("image_url", "%zdqrsoqashegymvqbkmm%")

  if (error) throw new Error(`Error leyendo productos: ${error.message}`)

  if (!products?.length) {
    console.log("")
    console.log("✅  No hay imágenes para migrar.")
    console.log("    Los image_url ya no apuntan al e-commerce,")
    console.log("    o todavía no tienen imagen asignada.")
    return
  }

  console.log(`\n📦  ${products.length} imagen(es) para migrar:\n`)

  let ok = 0
  let fail = 0

  for (const product of products) {
    const url = product.image_url

    try {
      // 1. Descargar la imagen directamente (el Storage es público, no necesita auth)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status} al descargar`)

      const buffer = await res.arrayBuffer()
      const contentType = res.headers.get("content-type") || "image/jpeg"

      // Nombre de archivo: tomamos la última parte de la URL
      const fileName = url.split("/").pop()?.split("?")[0] ?? `${product.id}.jpg`
      const destPath = `sulderm/${fileName}`

      // 2. Subir al Storage de Sistema
      const { error: uploadError } = await sistema.storage
        .from("products")
        .upload(destPath, buffer, { contentType, upsert: true })

      if (uploadError) throw new Error(`Error subiendo: ${uploadError.message}`)

      // 3. Obtener la URL pública en Sistema
      const { data: { publicUrl } } = sistema.storage
        .from("products")
        .getPublicUrl(destPath)

      // 4. Actualizar image_url en la tabla products
      const { error: updateError } = await sistema
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", product.id)

      if (updateError) throw new Error(`Error actualizando DB: ${updateError.message}`)

      console.log(`  ✅  ${product.name}`)
      ok++

    } catch (err) {
      console.error(`  ❌  ${product.name}: ${err.message}`)
      fail++
    }
  }

  console.log("")
  console.log(`🎉  Listo: ${ok} migradas, ${fail} fallidas`)
  console.log("")

  if (fail === 0) {
    console.log("✅  Podés borrar el proyecto del e-commerce sin perder ninguna imagen.")
  } else {
    console.log("⚠️   Revisá los errores antes de borrar el proyecto del e-commerce.")
  }
}

run().catch(err => {
  console.error("Error fatal:", err.message)
  process.exit(1)
})
