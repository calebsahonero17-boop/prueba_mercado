import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../contexts/ChatContext'; // Importar el contexto
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useContextoMensajesNoLeidos } from '../contexts/ContextoMensajesNoLeidos';
import { Spinner } from '../components/ui/Spinner';
import { MessageSquare, Send, Package2, Paperclip, Loader2, ArrowLeft, Mic, StopCircle, Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AvatarIniciales from '../components/ui/AvatarIniciales';
import AudioPlayer from '../components/ui/AudioPlayer'; // Importar el nuevo componente
import { supabase } from '../lib/supabase';

// Componente para la lista de conversaciones
const ConversationList = ({ currentUser }) => {
  const { conversations, activeConversationId, setActiveConversationId } = useChatContext();

  if (!conversations || conversations.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No tienes conversaciones activas.</div>;
  }

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="border-r border-gray-200 bg-gray-50/50">
      <h2 className="p-4 font-bold text-lg border-b bg-white sticky top-0 z-10">Chats</h2>
      <ul className="divide-y divide-gray-200">
        {conversations.map(convo => {
          if (!convo.comprador_id || !convo.vendedor_id) return null;
          
          const otherUser = convo.comprador_id.id === currentUser.id ? convo.vendedor_id : convo.comprador_id;
          const isActive = convo.id === activeConversationId;
          const hasUnread = convo.unread_count > 0;

          return (
            <li key={convo.id} onClick={() => setActiveConversationId(convo.id)} className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors border-l-4 ${isActive ? 'bg-blue-50 border-blue-600' : 'border-transparent'}`}>
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <AvatarIniciales nombres={otherUser.nombres || 'U'} apellidos={otherUser.apellidos || 'D'} src={otherUser.avatar} className="w-12 h-12" />
                  {hasUnread && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`font-semibold truncate ${isActive ? 'text-blue-800' : 'text-gray-800'}`}>{otherUser.nombres || 'Usuario'} {otherUser.apellidos || 'Eliminado'}</p>
                    <time className={`text-xs flex-shrink-0 ${hasUnread ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>{formatTime(convo.last_message_at)}</time>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}>
                      {convo.last_message_is_image ? '📷 Imagen' : convo.last_message_content || '...'}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Componente para la ventana de chat activa
const ChatWindow = ({ currentUser }) => {
  const { 
    messages, 
    loadingMessages, 
    sendMessage, 
    sendImage, 
    sendAudio,
    conversations,
    activeConversationId 
  } = useChatContext();
  
  const [newMessage, setNewMessage] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Estado para la grabación de audio
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    sendMessage(newMessage);
    setNewMessage('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) sendImage(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error al grabar:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  if (!activeConversation) return null; // No debería pasar si se usa correctamente

  if (loadingMessages) {
    return <div className="flex items-center justify-center h-full"><Spinner message="Cargando mensajes..."/></div>;
  }

  const otherUser = activeConversation.comprador_id.id === currentUser.id ? activeConversation.vendedor_id : activeConversation.comprador_id;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b p-4 flex items-center gap-4 bg-white flex-shrink-0">
        <AvatarIniciales nombres={otherUser.nombres} apellidos={otherUser.apellidos} src={otherUser.avatar} className="w-10 h-10" />
        <div>
          <h3 className="font-bold text-gray-900">{otherUser.nombres} {otherUser.apellidos}</h3>
          {activeConversation.producto_id && (
            <div className="flex items-center gap-2 text-sm text-gray-500"><Package2 className="w-4 h-4" /><span>{activeConversation.producto_id.nombre}</span></div>
          )}
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 p-6 overflow-y-auto">
        {messages.map(msg => {
          const esMio = msg.remitente_id === currentUser.id;
          return (
            <div key={msg.id} className={`flex gap-3 my-4 ${esMio ? 'justify-end' : 'justify-start'}`}>
              {!esMio && <AvatarIniciales nombres={msg.remitente?.nombres} apellidos={msg.remitente?.apellidos} src={msg.remitente?.avatar} className="w-8 h-8" />}
              <div className={`max-w-xs lg:max-w-md p-3 rounded-xl shadow-sm ${esMio ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-200 text-gray-800 rounded-bl-sm'}`}>
                {msg.imagen_url ? (
                  <div className="relative">
                    <img src={msg.imagen_url} alt="Imagen adjunta" className="rounded-lg max-w-full h-auto" />
                    {msg.estado_subida === 'cargando' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"><Loader2 className="w-6 h-6 text-white animate-spin" /></div>
                    )}
                  </div>
                ) : msg.audio_url ? (
                  <AudioPlayer src={msg.audio_url} isSender={esMio} />
                ) : (
                  <p className="break-words">{msg.contenido}</p>
                )}
                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.fecha_creacion).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {esMio && <AvatarIniciales nombres={currentUser.nombres} apellidos={currentUser.apellidos} src={currentUser.avatar} className="w-8 h-8" />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex-shrink-0">
        <div className="relative flex items-center">
          <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-600">
            <Paperclip className="w-5 h-5" />
          </button>
          <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" />
          
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="w-full pr-24 pl-4 py-3 border rounded-full bg-white focus:ring-2 focus:ring-blue-500" />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {isRecording ? (
              <button type="button" onClick={stopRecording} className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600">
                <StopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button type="button" onClick={startRecording} className="p-2 text-gray-500 hover:text-blue-600">
                <Mic className="w-5 h-5" />
              </button>
            )}
            <button type="submit" className="ml-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors shadow">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default function MensajesPage() {
  const { user } = useSupabaseAuth();
  const { conversations, loadingConversations, activeConversationId, setActiveConversationId } = useChatContext();
  const navigate = useNavigate();
  const { refrescarContadorNoLeidos } = useContextoMensajesNoLeidos();

  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      const markAsRead = async () => {
        const { error } = await supabase.rpc('mark_conversation_as_read', { conversation_id_in: activeConversationId });
        if (error) {
          console.error('Error marking messages as read:', error);
        } else {
          refrescarContadorNoLeidos();
        }
      };
      markAsRead();
    }
  }, [activeConversationId, refrescarContadorNoLeidos]);

  if (loadingConversations) {
    return <div className="flex items-center justify-center h-screen"><Spinner message="Cargando tus conversaciones..." /></div>;
  }

  if (!user) {
    return <div className="h-screen flex items-center justify-center">Debes iniciar sesión para ver tus mensajes.</div>
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="h-screen w-full flex flex-col bg-white">
      <div className="border-b p-4 flex-shrink-0 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Bandeja de Entrada</h1>
      </div>
      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="hidden md:flex flex-col w-1/3 lg:w-1/4 border-r overflow-y-auto">
          <ConversationList currentUser={user} />
        </div>
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <ChatWindow currentUser={user} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50/50">
              <MessageSquare className="w-32 h-32 mb-6 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-700">Selecciona una conversación</h2>
              <p className="max-w-sm">Elige una conversación de la lista para ver los mensajes o inicia una nueva desde la página de un producto.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}