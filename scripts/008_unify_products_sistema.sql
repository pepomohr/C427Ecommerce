-- =====================================================
-- CORRER EN: Proyecto "Sistema C427" en Supabase
-- =====================================================

-- Agregar columnas del ecommerce a la tabla products del Sistema
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Sincronizar price con price_list para productos existentes
UPDATE public.products
  SET price = price_list
  WHERE price IS NULL AND price_list IS NOT NULL;

UPDATE public.products
  SET is_active = TRUE
  WHERE is_active IS NULL;
