// lib/actions/product-actions.ts
"use server" 

import { createClient } from '@supabase/supabase-js';

// Cargamos las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Definimos la interfaz para que TypeScript no chille
interface ProductDetail {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  is_active?: boolean;
  tags?: string[];
}

/**
 * Busca los productos específicos para mostrar en el resultado del Quiz.
 * Se eliminó la columna 'category' porque no existe en la tabla de Supabase.
 */
export async function getProductsForQuiz(productIds: string[]): Promise<ProductDetail[]> {
  try {
    // 1. Limpieza de IDs recibidos
    const cleanIds = (productIds || [])
      .filter(id => id && typeof id === 'string' && id.trim().length > 0)
      .map(id => id.trim());

    if (cleanIds.length === 0) {
      console.warn('[getProductsForQuiz] No se pasaron IDs válidos.');
      return [];
    }

    // 2. Inicialización del cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 3. Consulta a la base de datos (Sin la columna 'category' que daba error 42703)
    const { data, error } = await supabase
      .from('products') 
      .select('id, name, price, stock, image_url, is_active, tags') 
      .in('id', cleanIds);

    // 4. Manejo de errores de Supabase
    if (error) {
      console.error('[getProductsForQuiz] Error de Postgres:', error.message);
      return [];
    }

    if (!data) return [];

    // 5. Filtro: activos y con stock disponible
    const result = data.filter(p => p.is_active !== false && (p.stock ?? 1) > 0);

    // 6. Logs de Debugging para David (Mirá la terminal de VS Code)
    console.log(`\n--- 🧪 DEBUG QUIZ C427 ---`);
    console.log(`Solicitados: ${cleanIds.length}`);
    console.log(`Encontrados en DB: ${data.length}`);
    console.log(`Activos para mostrar: ${result.length}`);
    
    if (data.length < cleanIds.length) {
      const encontrados = data.map(d => d.id);
      const faltantes = cleanIds.filter(id => !encontrados.includes(id));
      console.warn("⚠️ IDs QUE NO EXISTEN EN TU SUPABASE:", faltantes);
    }
    console.log(`---------------------------\n`);

    return result as ProductDetail[];

  } catch (error: any) {
    console.error('[getProductsForQuiz] Error Fatal en el Servidor:', error);
    return [];
  }
}