import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { validarImagen, comprimirImagen, subirArchivo } from '../lib/storage';

// Definimos los tipos para que el código sea más limpio
export interface ChatMessage {
  id: string;
  contenido: string | null; // El contenido puede ser nulo si es una imagen
  imagen_url?: string | null; // URL de la imagen
  audio_url?: string | null; // URL del audio
  fecha_creacion: string;
  remitente_id: string;
  // Opcionalmente, podemos incluir el perfil del remitente
  remitente?: { nombres: string; apellidos: string; avatar: string; };
  // Estado para la subida de archivos
  estado_subida?: 'cargando' | 'completo' | 'error';
}

// INTERFAZ ACTUALIZADA: Ahora incluye los detalles que necesitamos para la UI
export interface Conversation {
  id: string;
  comprador_id: { id: string; nombres: string; apellidos: string; avatar: string; };
  vendedor_id: { id: string; nombres: string; apellidos: string; avatar: string; };
  producto_id?: { id: string; nombre: string; };
  // Nuevos campos enriquecidos desde la base de datos
  last_message_content: string | null;
  last_message_at: string | null;
  last_message_is_image: boolean;
  unread_count: number;
}

export const useChat = (conversationId: string | null) => {
  const { user } = useSupabaseAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // FUNCIÓN ACTUALIZADA: Llama a la nueva función RPC de la base de datos
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    const { data, error } = await supabase
      .rpc('get_conversations_with_details', { p_user_id: user.id });

    if (error) {
      console.error('Error fetching enriched conversations:', error);
    } else {
      setConversations(data as Conversation[]);
    }
    setLoadingConversations(false);
  }, [user]);

  const fetchMessages = useCallback(async (convoId: string) => {
    if (!convoId) return;
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('mensajes')
      .select(`*, remitente:perfiles(nombres, apellidos, avatar)`)
      .eq('conversacion_id', convoId)
      .order('fecha_creacion', { ascending: true });
    if (error) console.error('Error fetching messages:', error);
    else setMessages(data as ChatMessage[]);
    setLoadingMessages(false);
  }, []);

  const sendMessage = useCallback(async (contenido: string) => {
    if (!user || !conversationId || !contenido.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      contenido: contenido.trim(),
      fecha_creacion: new Date().toISOString(),
      remitente_id: user.id,
      remitente: { nombres: user.nombres, apellidos: user.apellidos, avatar: user.avatar }
    };
    setMessages(prev => [...prev, newMessage]);

    const { data, error } = await supabase
      .from('mensajes')
      .insert({
        conversacion_id: conversationId,
        remitente_id: user.id,
        contenido: contenido.trim()
      })
      .select('*, remitente:perfiles(nombres, apellidos, avatar)')
      .single();

    if (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } else if (data) {
      // Reemplazar el mensaje temporal con el real de la BD
      setMessages(prev => prev.map(m => m.id === tempId ? data as ChatMessage : m));
    }
  }, [user, conversationId]);

  // --- FUNCIÓN PARA ENVIAR IMÁGENES (CORREGIDA) ---
  const sendImage = useCallback(async (file: File) => {
    if (!user || !conversationId) return;

    const validacion = validarImagen(file);
    if (!validacion.valido) {
      console.error(validacion.error);
      return;
    }

    const tempId = `temp-img-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file);
    const newMessage: ChatMessage = {
      id: tempId,
      contenido: null,
      imagen_url: previewUrl,
      fecha_creacion: new Date().toISOString(),
      remitente_id: user.id,
      remitente: { nombres: user.nombres, apellidos: user.apellidos, avatar: user.avatar },
      estado_subida: 'cargando',
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      const imagenComprimida = await comprimirImagen(file);
      const rutaBase = `${conversationId}/${user.id}-${Date.now()}`;
      const publicUrl = await subirArchivo(imagenComprimida, 'chat_images', rutaBase);

      const { data, error: insertError } = await supabase
        .from('mensajes')
        .insert({
          conversacion_id: conversationId,
          remitente_id: user.id,
          imagen_url: publicUrl,
        })
        .select('*, remitente:perfiles(nombres, apellidos, avatar)')
        .single();

      if (insertError) throw insertError;

      if (data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data as ChatMessage : m));
      }

    } catch (error) {
      console.error("Error al enviar imagen:", error);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, estado_subida: 'error' } : m));
    }
  }, [user, conversationId]);

  // --- NUEVA FUNCIÓN PARA ENVIAR AUDIO ---
  const sendAudio = useCallback(async (file: File) => {
    if (!user || !conversationId) return;

    const tempId = `temp-audio-${Date.now()}`;
    const previewUrl = URL.createObjectURL(file); // Para previsualización local si es necesario
    const newMessage: ChatMessage = {
      id: tempId,
      contenido: null,
      audio_url: previewUrl, // Usamos la URL local para la previsualización
      fecha_creacion: new Date().toISOString(),
      remitente_id: user.id,
      remitente: { nombres: user.nombres, apellidos: user.apellidos, avatar: user.avatar },
      estado_subida: 'cargando',
    };
    setMessages(prev => [...prev, newMessage]);

    try {
      const rutaBase = `${conversationId}/${user.id}-${Date.now()}.webm`; // Asumiendo formato webm
      const publicUrl = await subirArchivo(file, 'chat_audio', rutaBase);

      const { data, error: insertError } = await supabase
        .from('mensajes')
        .insert({
          conversacion_id: conversationId,
          remitente_id: user.id,
          audio_url: publicUrl,
        })
        .select('*, remitente:perfiles(nombres, apellidos, avatar)')
        .single();

      if (insertError) throw insertError;

      if (data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data as ChatMessage : m));
      }

    } catch (error) {
      console.error("Error DETALLADO al enviar audio :", JSON.stringify(error, null, 2) );
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, estado_subida: 'error' } : m));
    }
  }, [user, conversationId]);


  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  useEffect(() => {
    if (conversationId) fetchMessages(conversationId);
  }, [conversationId, fetchMessages]);

  // --- EFFECT DE SUSCRIPCIÓN (MEJORADO) ---
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `conversacion_id=eq.${conversationId}`
      },
      async (payload) => {
        const newMessageId = payload.new.id;

        // Evitar añadir un mensaje que ya existe (por el reemplazo optimista)
        if (messages.some(msg => msg.id === newMessageId)) {
          return;
        }

        // Si el mensaje es del otro usuario, necesitamos sus datos de perfil
        if (payload.new.remitente_id !== user?.id) {
          const { data: remitenteData, error } = await supabase
            .from('perfiles')
            .select('nombres, apellidos, avatar')
            .eq('id', payload.new.remitente_id)
            .single();

          if (error) {
            console.error("Error fetching sender profile for real-time message:", error);
          } else {
             const fullMessage: ChatMessage = {
              ...(payload.new as ChatMessage),
              remitente: remitenteData
            };
            setMessages((prev) => [...prev, fullMessage]);
          }
        }
        // Si el mensaje es nuestro pero no se añadió por la vía optimista (ej. desde otro tab),
        // la lógica anterior de `sendMessage` ya lo habrá reemplazado.
        // Este bloque solo captura mensajes de la otra persona.
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, messages]); // 'messages' y 'user' son dependencias importantes ahora

  const startConversation = useCallback(async (vendedorId: string, productoId: string) => {
    if (!user) return null;
    let { data: existing } = await supabase.from('conversaciones').select('id').eq('comprador_id', user.id).eq('vendedor_id', vendedorId).eq('producto_id', productoId).single();
    if (existing) return existing.id;
    const { data: newConversation, error } = await supabase.from('conversaciones').insert({ comprador_id: user.id, vendedor_id: vendedorId, producto_id: productoId }).select('id').single();
    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    if (newConversation) {
      fetchConversations();
      return newConversation.id;
    }
    return null;
  }, [user, fetchConversations]);

  return { conversations, loadingConversations, messages, loadingMessages, sendMessage, sendImage, sendAudio, startConversation };
};