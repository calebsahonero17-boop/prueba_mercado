import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export const useUnreadMessages = () => {
  const { user } = useSupabaseAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Función para obtener el conteo desde la base de datos
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { data, error } = await supabase.rpc('count_unread_messages');

    if (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadCount(0);
    } else {
      setUnreadCount(data);
    }
  }, [user]);

  // Efecto para obtener el conteo inicial
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Efecto para escuchar cambios en TIEMPO REAL
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:mensajes')
      .on(
        'postgres_changes',
        {
          event: '* ', // Escuchar todos los eventos: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'mensajes',
        },
        (payload) => {
          // Cuando llega un mensaje nuevo, simplemente volvemos a contar.
          // Esto es más simple y robusto que intentar manejar el conteo en el cliente.
          console.log('Nuevo mensaje recibido, actualizando conteo...');
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Limpieza de la suscripción
    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, fetchUnreadCount]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
};
