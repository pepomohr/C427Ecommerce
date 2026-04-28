-- ============================================================
-- CORRER EN: Ecommerce (Supabase del ECOMMERCE)
-- Elimina el FK de order_items → products porque los productos
-- ahora viven en el DB del Sistema, no en el ecommerce
-- ============================================================

-- Buscar y eliminar el FK constraint
ALTER TABLE order_items
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- product_id pasa a ser un campo de referencia libre (UUID del Sistema)
-- No necesitamos la tabla products del ecommerce para nada más

-- Opcional: limpiar productos viejos del ecommerce si ya no se usan
-- (no correr hasta confirmar que el ecommerce ya lee del Sistema)
-- TRUNCATE TABLE products CASCADE;
