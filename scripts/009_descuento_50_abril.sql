-- =============================================
-- DESCUENTO 50% ABRIL - APLICAR
-- Correr en Supabase SQL Editor del ECOMMERCE
-- =============================================

-- Paso 1: agregar columna original_price si no existe
ALTER TABLE products
ADD COLUMN IF NOT EXISTS original_price NUMERIC;

-- Paso 2: guardar precio actual y aplicar 50% de descuento
-- Solo a los que NO tienen ya original_price (para no pisarlo si se vuelve a correr)
UPDATE products
SET
  original_price = price,
  price = ROUND(price * 0.5, 0)
WHERE is_active = true
  AND original_price IS NULL;

-- Verificar resultado:
SELECT name, original_price, price FROM products WHERE is_active = true ORDER BY name;


-- =============================================
-- PARA REVERTIR EL 1 DE MAYO:
-- =============================================
-- UPDATE products
-- SET price = original_price, original_price = NULL
-- WHERE original_price IS NOT NULL;
