-- Function to decrement product stock
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id AND stock >= quantity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
