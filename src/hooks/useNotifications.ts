import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export interface Notification {
  id: number;
  destinatario_id: string;
  remitente_id: string;
  producto_id: string;
  tipo: string;
  mensaje: string;
  leido: boolean;
  url_destino: string;
  fecha_creacion: string;
}

export function useNotifications() {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('destinatario_id', user.id)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      const unread = data?.filter(n => !n.leido).length || 0;
      setUnreadCount(unread);

    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Subscripción en tiempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`public:notificaciones:destinatario_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notificaciones' },
        (payload) => {
          setNotifications(current => [payload.new as Notification, ...current]);
          setUnreadCount(current => current + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: number) => {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({ leido: true })
        .eq('id', notificationId)
        .select();

      if (error) throw error;

      if (data) {
        setNotifications(current =>
          current.map(n => (n.id === notificationId ? { ...n, leido: true } : n))
        );
        setUnreadCount(current => Math.max(0, current - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    try {
        const { error } = await supabase
            .from('notificaciones')
            .update({ leido: true })
            .eq('destinatario_id', user.id)
            .eq('leido', false);

        if (error) throw error;

        setNotifications(current => current.map(n => ({ ...n, leido: true })));
        setUnreadCount(0);
    } catch (error) {
        console.error("Error marking all as read:", error);
    }
  };


  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
