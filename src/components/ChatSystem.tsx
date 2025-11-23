import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Send,
  X,
  Clock,
  CheckCheck,
  ArrowLeft,
  Package,
  Mic,
  StopCircle,
  Play,
  Pause,
  Paperclip
} from 'lucide-react';
import { Card, Button, Input } from './ui';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';
import { useChatContext } from '../contexts/ChatContext'; // Importar el contexto del chat
import AvatarIniciales from './ui/AvatarIniciales';
import AudioPlayer from './ui/AudioPlayer';

// El componente ya no necesita props, ya que todo se gestiona a través del contexto
function ChatSystem() {
  const { user } = useSupabaseAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Obtener todo el estado y las funciones del contexto del chat
  const {
    isChatOpen,
    closeChat,
    conversations,
    loadingConversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    sendImage,
    sendAudio,
    startConversation
  } = useChatContext();

  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // --- ESTADO Y REFERENCIAS PARA GRABACIÓN DE AUDIO ---
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handleProfileClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    closeChat(); // Usar la función del contexto
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lógica para cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        closeChat(); // Usar la función del contexto
      }
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen, closeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const enviarMensajeLocal = async () => {
    if (!nuevoMensaje.trim() || !activeConversationId || !user) return;
    const mensajeTexto = nuevoMensaje.trim();
    setNuevoMensaje('');
    await sendMessage(mensajeTexto);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeConversationId) {
      sendImage(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  // --- FUNCIONES DE GRABACIÓN DE AUDIO ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(url);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioURL(null);
    } catch (error) {
      console.error("Error al iniciar la grabación:", error);
      toast.error("No se pudo iniciar la grabación. Asegúrate de dar permiso al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const sendRecordedAudio = async () => {
    if (audioBlob && activeConversationId) {
      await sendAudio(audioBlob);
      cancelRecording();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setAudioBlob(null);
    setAudioURL(null);
    setIsRecording(false);
    setIsPlayingPreview(false);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
  };

  const togglePlayPreview = () => {
    if (audioPreviewRef.current && audioURL) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause();
      } else {
        audioPreviewRef.current.play();
      }
      setIsPlayingPreview(!isPlayingPreview);
    }
  };

  useEffect(() => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    }
  }, [audioURL]);

  const formatearFecha = (fecha: string) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diferencia / 60000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    if (minutos < 1440) return `${Math.floor(minutos / 60)}h`;
    return date.toLocaleDateString('es-BO');
  };

  if (!isChatOpen) return null; // Controlado por el contexto

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card variant="elevated" padding="none" className="w-full max-w-4xl h-[600px] flex flex-col" ref={chatWindowRef}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {activeConversation ? 'Chat' : 'Mis Conversaciones'}
              </h2>
              {activeConversation && (
                <p className="text-sm text-gray-600">
                  {activeConversation.producto_id?.nombre}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeConversation && (
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={() => setActiveConversationId(null)}
              >
                Volver
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={closeChat} // Usar la función del contexto
            >
              Cerrar
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {!activeConversation && (
            <div className="w-full">
              {loadingConversations ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando conversaciones...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay conversaciones</h3>
                  <p className="text-gray-600">Inicia una conversación contactando a un vendedor</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conv) => {
                    if (!conv.comprador_id || !conv.vendedor_id) return null;
                    const otroUsuario = conv.comprador_id.id === user?.id ? conv.vendedor_id : conv.comprador_id;
                    const tieneNoLeidos = conv.unread_count > 0;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div onClick={(e) => handleProfileClick(e, otroUsuario.id)} className="cursor-pointer flex-shrink-0">
                            <AvatarIniciales 
                              nombres={otroUsuario.nombres} 
                              apellidos={otroUsuario.apellidos} 
                              src={otroUsuario.avatar}
                              className="w-12 h-12"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 truncate">
                                {otroUsuario.nombres} {otroUsuario.apellidos}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatearFecha(conv.last_message_at || '')}
                                </span>
                                {tieneNoLeidos && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                            </div>

                            {conv.producto_id && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                <Package className="w-3 h-3" />
                                {conv.producto_id.nombre}
                              </div>
                            )}

                            <p className="text-sm text-gray-600 truncate">
                              {conv.last_message_is_image ? '📷 Imagen' : conv.last_message_content || 'Conversación iniciada'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeConversation && (
            <div className="w-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((mensaje) => {
                  const esMio = mensaje.remitente_id === user?.id;

                  return (
                    <div
                      key={mensaje.id}
                      className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        esMio
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        {mensaje.imagen_url ? (
                          <img src={mensaje.imagen_url} alt="Imagen adjunta" className="rounded-lg max-w-full h-auto" />
                        ) : mensaje.audio_url ? (
                          <AudioPlayer src={mensaje.audio_url} isSender={esMio} />
                        ) : (
                          <p className="break-words">{mensaje.contenido}</p>
                        )}
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          esMio ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {new Date(mensaje.fecha_creacion).toLocaleTimeString('es-BO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {esMio && mensaje.estado_subida === 'cargando' && (
                            <span className="text-xs animate-pulse">Enviando...</span>
                          )}
                          {esMio && mensaje.estado_subida === 'error' && (
                            <span className="text-xs text-red-300">Error</span>
                          )}
                          {esMio && mensaje.estado_subida === 'completo' && (
                            <CheckCheck className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2 items-center">
                  {isRecording ? (
                    <Button variant="destructive" icon={StopCircle} onClick={stopRecording}>
                      Detener
                    </Button>
                  ) : audioURL ? (
                    <>
                      <audio ref={audioPreviewRef} src={audioURL} preload="auto" className="hidden" />
                      <Button variant="ghost" icon={isPlayingPreview ? Pause : Play} onClick={togglePlayPreview} />
                      <Button variant="primary" icon={Send} onClick={sendRecordedAudio} />
                      <Button variant="outline" icon={X} onClick={cancelRecording} />
                    </>
                  ) : (
                    <>
                      <Input
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        onKeyPress={(e) => e.key === 'Enter' && enviarMensajeLocal()}
                        className="flex-1"
                        disabled={isRecording || !!audioURL}
                      />
                      <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" />
                      <Button variant="ghost" icon={Paperclip} onClick={() => imageInputRef.current?.click()} disabled={isRecording || !!audioURL} />
                      <Button variant="ghost" icon={Mic} onClick={startRecording} disabled={isRecording || !!audioURL} />
                      <Button
                        variant="primary"
                        icon={Send}
                        onClick={enviarMensajeLocal}
                        disabled={!nuevoMensaje.trim() || isRecording || !!audioURL}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ChatSystem;