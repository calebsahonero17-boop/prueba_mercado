import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { useToast } from './ToastContext';

interface FavoritosContextType {
  favoritos: Set<string>;
  agregarFavorito: (productoId: string) => Promise<void>;
  quitarFavorito: (productoId: string) => Promise<void>;
  esFavorito: (productoId: string) => boolean;
  loading: boolean;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  const toast = useToast();
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFavoritos = useCallback(async () => {
    if (!user) {
      setFavoritos(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('producto_id')
        .eq('usuario_id', user.id);

      if (error) {
        throw error;
      }

      const favoriteIds = new Set(data.map(fav => fav.producto_id));
      setFavoritos(favoriteIds);
    } catch (error: any) {
      console.error('Error fetching favoritos:', error);
      // No mostramos toast aquí para no molestar al cargar la página
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavoritos();
  }, [fetchFavoritos]);

  const agregarFavorito = async (productoId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para añadir a favoritos.');
      return;
    }

    // Actualización optimista para una UI más rápida
    const newFavoritos = new Set(favoritos);
    newFavoritos.add(productoId);
    setFavoritos(newFavoritos);

    try {
      const { error } = await supabase
        .from('favoritos')
        .insert({ usuario_id: user.id, producto_id: productoId });

      if (error) {
        // Revertir en caso de error
        const revertedFavoritos = new Set(favoritos);
        revertedFavoritos.delete(productoId);
        setFavoritos(revertedFavoritos);
        toast.error('No se pudo añadir a favoritos.');
        throw error;
      }
    } catch (error: any) {
      console.error('Error adding favorito:', error);
    }
  };

  const quitarFavorito = async (productoId: string) => {
    if (!user) return;

    // Actualización optimista
    const newFavoritos = new Set(favoritos);
    newFavoritos.delete(productoId);
    setFavoritos(newFavoritos);

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('usuario_id', user.id)
        .eq('producto_id', productoId);

      if (error) {
        // Revertir en caso de error
        const revertedFavoritos = new Set(favoritos);
        revertedFavoritos.add(productoId);
        setFavoritos(revertedFavoritos);
        toast.error('No se pudo quitar de favoritos.');
        throw error;
      }
    } catch (error: any) {
      console.error('Error removing favorito:', error);
    }
  };

  const esFavorito = (productoId: string) => {
    return favoritos.has(productoId);
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, agregarFavorito, quitarFavorito, esFavorito, loading }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (context === undefined) {
    throw new Error('useFavoritos must be used within a FavoritosProvider');
  }
  return context;
}
