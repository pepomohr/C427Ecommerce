// lib/actions/product-actions.ts

"use server" 

import { createClient } from '@/lib/supabase/server'; 
import { revalidatePath } from 'next/cache';

// Tipado necesario para el frontend
interface ProductDetail {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
}

export async function getProductsForQuiz(productIds: string[]): Promise<ProductDetail[]> {
  try {
    if (!productIds || productIds.length === 0) {
      console.error("Lista de IDs vacía. No se puede consultar la DB.");
      return [];
    }

    // EL FIX FINAL: AWAIT para que el cliente de Supabase se inicialice
    const supabase = await createClient(); 

    // 1. Consulta a la base de datos
    const { data, error } = await supabase
      .from('products') // <--- VERIFICAR: Si tu tabla se llama 'products', cambiá aquí.
      .select('id, name, price, stock, image_url, category') 
      .in('id', productIds); 

    if (error) {
      console.error('SERVER ACTION ERROR: Supabase Fallo. Mensaje:', error.message);
      return [];
    }

    // DEBUG: Muestra lo encontrado antes de devolverlo
    console.log('IDs Buscados:', productIds.length); 
    console.log('Productos encontrados en DB:', data.length); 

    return data as ProductDetail[];

  } catch (error) {
    console.error('Error general en Server Action:', error);
    return [];
  }
}