-- =============================================
-- SISTEMA C427 - Agregar patient_name a sales
-- Correr en Supabase SQL Editor del SISTEMA C427
-- (NO en el ecommerce, en el sistema del consultorio)
-- =============================================

-- Permite guardar el nombre del cliente web sin FK a la tabla patients
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS patient_name TEXT;

-- Verificar:
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'sales' ORDER BY ordinal_position;
