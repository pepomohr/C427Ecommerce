-- Insert sample products for the aesthetic clinic
INSERT INTO public.products (name, description, price, stock, category, image_url, is_active) VALUES
  ('Serum Vitamina C', 'Serum facial con vitamina C para iluminar y rejuvenecer la piel', 4500.00, 50, 'Facial', '/placeholder.svg?height=400&width=400', TRUE),
  ('Crema Hidratante Facial', 'Crema hidratante profunda para todo tipo de piel', 3200.00, 75, 'Facial', '/placeholder.svg?height=400&width=400', TRUE),
  ('Exfoliante Corporal', 'Exfoliante corporal con extractos naturales', 2800.00, 40, 'Corporal', '/placeholder.svg?height=400&width=400', TRUE),
  ('Aceite Reafirmante', 'Aceite corporal reafirmante con colágeno', 5200.00, 30, 'Corporal', '/placeholder.svg?height=400&width=400', TRUE),
  ('Mascarilla Facial Detox', 'Mascarilla purificante con carbón activado', 3800.00, 60, 'Facial', '/placeholder.svg?height=400&width=400', TRUE),
  ('Crema Anticelulítica', 'Crema reductora para combatir la celulitis', 4800.00, 45, 'Corporal', '/placeholder.svg?height=400&width=400', TRUE),
  ('Contorno de Ojos', 'Tratamiento para ojeras y líneas de expresión', 4200.00, 35, 'Facial', '/placeholder.svg?height=400&width=400', TRUE),
  ('Gel Reductor Abdominal', 'Gel efecto frío para reducir medidas', 3900.00, 50, 'Corporal', '/placeholder.svg?height=400&width=400', TRUE)
ON CONFLICT DO NOTHING;
