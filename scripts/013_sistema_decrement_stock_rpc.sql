-- ============================================================
-- CORRER EN: Sistema C427 (Supabase del SISTEMA)
-- Crea una función RPC para decrementar stock de forma atómica
-- Evita condiciones de carrera si dos ventas ocurren al mismo tiempo
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, qty INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - qty)
  WHERE id = product_id::uuid;
END;
$$;
