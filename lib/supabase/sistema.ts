import { createClient } from "@supabase/supabase-js"

// Cliente server-side (service role) para el DB del Sistema C427
// Usar SOLO en API routes / server components — nunca en el cliente
export function getSistemaSupabase() {
  const url = process.env.SISTEMA_SUPABASE_URL
  const key = process.env.SISTEMA_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("SISTEMA_SUPABASE_URL o SISTEMA_SERVICE_ROLE_KEY no configurados")
  return createClient(url, key)
}
