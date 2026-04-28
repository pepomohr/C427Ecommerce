/**
 * SCRIPT DE MIGRACIÓN DE IMÁGENES
 * =================================
 * Copia las imágenes del Storage del e-commerce al Storage del Sistema C427.
 * Actualiza los image_url en la tabla products del Sistema.
 *
 * CÓMO USAR:
 *   1. Copiá las variables de entorno abajo
 *   2. Corré: node scripts/migrate-images-to-sistema.mjs
 */

import { createClient } from "@supabase/supabase-js"

// ── Config ────────────────────────────────────────────────────────────────────
// E-commerce (origen)
const ECOMMERCE_URL = "https://zdqrsoqashegymvqbkmm.supabase.co"
const ECOMMERCE_KEY = process.env.ECOMMERCE_SERVICE_ROLE_KEY // service role del e-commerce

// Sistema (destino)
const SISTEMA_URL   = "https://hwkhcwdqicgnvitlcmwr.supabase.co"
const SISTEMA_KEY   = process.env.SISTEMA_SERVICE_ROLE_KEY // service role del sistema

// Nombre del bucket de imágenes en cada proyecto (ajustar si difiere)
const BUCKET_ORIGEN  = "products"
const BUCKET_DESTINO = "products"
// ─────────────────────────────────────────────────────────────────────────────

if (!ECOMMERCE_KEY || !SISTEMA_KEY) {
  console.error("❌  Falta ECOMMERCE_SERVICE_ROLE_KEY o SISTEMA_SERVICE_ROLE_KEY en el entorno.")
  console.error("    Exportalas antes de correr el script:")
  console.error("    set ECOMMERCE_SERVICE_ROLE_KEY=xxx && set SISTEMA_SERVICE_ROLE_KEY=yyy")
  process.exit(1)
}

const ecommerce = createClient(ECOMMERCE_URL, ECOMMERCE_KEY)
const sistema   = createClient(SISTEMA_URL,   SISTEMA_KEY)

async function ensureBucket() {
  const { data: buckets } = await sistema.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET_DESTINO)
  if (!exists) {
    const { error } = await sistema.storage.createBucket(BUCKET_DESTINO, { public: true })
    if (error) throw new Error(`No se pudo crear el bucket: ${error.message}`)
    console.log(`✅  Bucket "${BUCKET_DESTINO}" creado en Sistema`)
  } else {
    console.log(`ℹ️   Bucket "${BUCKET_DESTINO}" ya existe en Sistema`)
  }
}

async function migrateImages() {
  await ensureBucket()

  // Traer todos los productos de Sistema que tienen image_url del e-commerce
  const { data: products, error } = await sistema
    .from("products")
    .select("id, name, image_url")
    .ilike("image_url", `%${ECOMMERCE_URL}%`)

  if (error) throw new Error(`Error leyendo productos: ${error.message}`)
  if (!products?.length) {
    console.log("✅  No hay imágenes que migrar (no se encontraron URLs del e-commerce).")
    return
  }

  console.log(`\n📦  ${products.length} producto(s) con imágenes para migrar:\n`)

  let migrated = 0
  let failed   = 0

  for (const product of products) {
    try {
      const url = product.image_url
      // Extraer el path dentro del bucket desde la URL pública
      // URL format: .../storage/v1/object/public/<bucket>/<path>
      const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/)
      if (!match) {
        console.warn(`  ⚠️  ${product.name}: URL no reconocida → ${url}`)
        failed++
        continue
      }
      const filePath = match[1]
      const fileName = filePath.split("/").pop() ?? filePath

      // Descargar desde el e-commerce
      const { data: fileData, error: downloadError } = await ecommerce.storage
        .from(BUCKET_ORIGEN)
        .download(filePath)

      if (downloadError || !fileData) {
        console.error(`  ❌  ${product.name}: error descargando → ${downloadError?.message}`)
        failed++
        continue
      }

      // Subir al Sistema
      const destPath = `migrated/${fileName}`
      const { error: uploadError } = await sistema.storage
        .from(BUCKET_DESTINO)
        .upload(destPath, fileData, { upsert: true, contentType: fileData.type })

      if (uploadError) {
        console.error(`  ❌  ${product.name}: error subiendo → ${uploadError.message}`)
        failed++
        continue
      }

      // Obtener URL pública en Sistema
      const { data: { publicUrl } } = sistema.storage
        .from(BUCKET_DESTINO)
        .getPublicUrl(destPath)

      // Actualizar image_url en products
      const { error: updateError } = await sistema
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", product.id)

      if (updateError) {
        console.error(`  ❌  ${product.name}: error actualizando DB → ${updateError.message}`)
        failed++
        continue
      }

      console.log(`  ✅  ${product.name}`)
      migrated++
    } catch (err) {
      console.error(`  ❌  ${product.name}: error inesperado → ${err.message}`)
      failed++
    }
  }

  console.log(`\n🎉  Migración terminada: ${migrated} migradas, ${failed} fallidas\n`)
  if (failed === 0) {
    console.log("✅  Podés borrar el proyecto del e-commerce sin perder imágenes.")
  } else {
    console.log("⚠️   Revisá los errores antes de borrar el proyecto del e-commerce.")
  }
}

migrateImages().catch(err => {
  console.error("Error fatal:", err)
  process.exit(1)
})
