-- Agregar columna de dirección de envío a orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Permitir que el webhook (service role) actualice pedidos
CREATE POLICY IF NOT EXISTS "Service role puede actualizar pedidos" ON public.orders
  FOR UPDATE USING (true);

-- Permitir que el webhook actualice order_items
CREATE POLICY IF NOT EXISTS "Service role puede ver order items" ON public.order_items
  FOR SELECT USING (true);
