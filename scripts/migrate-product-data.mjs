/**
 * Genera un archivo SQL con los UPDATE de tags/description/usage_mode/usage_results
 * del e-commerce → Sistema C427. No ejecuta nada, solo crea el archivo.
 *
 * USO:
 *   set ECOMMERCE_SERVICE_ROLE_KEY=eyJ...
 *   node scripts/migrate-product-data.mjs
 *
 * Luego abrís el archivo generado y lo pegás en el SQL Editor de Supabase Sistema.
 */

import { createClient } from "@supabase/supabase-js"
import { writeFileSync } from "fs"

if (!process.env.ECOMMERCE_SERVICE_ROLE_KEY) {
  console.error("Falta ECOMMERCE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const ecommerce = createClient(
  "https://zdqrsoqashegymvqbkmm.supabase.co",
  process.env.ECOMMERCE_SERVICE_ROLE_KEY
)

const { data: products, error } = await ecommerce
  .from("products")
  .select("id, name, description, tags, usage_mode, usage_results")

if (error || !products?.length) {
  console.error("Error leyendo productos:", error?.message)
  process.exit(1)
}

const escape = (s) => s ? s.replace(/'/g, "''") : null
const val    = (s) => s ? `'${escape(s)}'` : "NULL"
const tags   = (t) => t?.length ? `ARRAY[${t.map(x => `'${escape(x)}'`).join(",")}]` : "NULL"

const lines = ["-- Migración de tags/description/usage_mode/usage_results → Sistema C427", "-- Pegá esto en el SQL Editor de Supabase Sistema (hwkhcwdqicgnvitlcmwr)", ""]

for (const p of products) {
  lines.push(`UPDATE products SET`)
  lines.push(`  description   = ${val(p.description)},`)
  lines.push(`  tags          = ${tags(p.tags)},`)
  lines.push(`  usage_mode    = ${val(p.usage_mode)},`)
  lines.push(`  usage_results = ${val(p.usage_results)}`)
  lines.push(`WHERE id = '${p.id}'; -- ${p.name}`)
  lines.push("")
}

const output = "scripts/product-data-migration.sql"
writeFileSync(output, lines.join("\n"), "utf8")
console.log(`\n✅ Archivo generado: ${output}`)
console.log(`   Abrilo, revisalo y pegalo en el SQL Editor de Supabase Sistema.\n`)
