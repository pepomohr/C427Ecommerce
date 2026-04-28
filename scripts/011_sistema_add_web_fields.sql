-- ============================================================
-- CORRER EN: Sistema C427 (Supabase del SISTEMA, no del ecommerce)
-- Agrega campos web a la tabla products del Sistema
-- para que sea la única fuente de verdad de productos
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS description       TEXT,
  ADD COLUMN IF NOT EXISTS image_url         TEXT,
  ADD COLUMN IF NOT EXISTS tags              TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS web_visible       BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS web_category      TEXT,
  ADD COLUMN IF NOT EXISTS original_price    DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS usage_mode        TEXT,
  ADD COLUMN IF NOT EXISTS usage_results     TEXT;

-- Habilitar RLS (si no estaba)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública para el ecommerce (anon key)
DROP POLICY IF EXISTS "Public read web visible products" ON products;
CREATE POLICY "Public read web visible products"
  ON products FOR SELECT
  USING (web_visible = TRUE);

-- Política para service_role (ecommerce backend lee todo)
DROP POLICY IF EXISTS "Service role full access" ON products;
CREATE POLICY "Service role full access"
  ON products FOR ALL
  USING (auth.role() = 'service_role');
