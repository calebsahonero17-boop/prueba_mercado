import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Definimos la estructura de una reseña, incluyendo los datos del comprador
export interface Review {
  id: number;
  calificacion: number;
  comentario: string;
  fecha_creacion: string;
  comprador: {
    nombres: string;
    apellidos: string;
    avatar: string;
  } | null;
}

export function useReviews(vendedorId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!vendedorId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('reseñas')
        // Seleccionamos todos los campos de la reseña
        // y de la tabla relacionada 'perfiles' (a la que llamamos 'comprador'), traemos los datos del comprador
        .select('id, calificacion, comentario, fecha_creacion, comprador:comprador_id(nombres, apellidos, avatar)')
        .eq('vendedor_id', vendedorId)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw error;
      }

      setReviews(data as Review[]);
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [vendedorId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Devolvemos una función para poder recargar las reseñas desde fuera si es necesario
  return { reviews, loading, error, refetch: fetchReviews };
}
