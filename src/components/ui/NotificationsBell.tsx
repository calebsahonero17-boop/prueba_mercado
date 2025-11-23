import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

// Helper para formatear el tiempo transcurrido
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `hace ${Math.floor(interval)} min`;
  return `hace ${Math.floor(seconds)} s`;
}


export default function NotificationsBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cerrar el dropdown si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const handleNotificationClick = (notification: Notification) => {
    if (!notification.leido) {
      markAsRead(notification.id);
    }
    // La URL de destino de la notificación puede que no exista como ruta aún.
    // Si existe, navegamos. Si no, solo cerramos el panel.
    if (notification.url_destino) {
      navigate(notification.url_destino);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border z-50 animate-fade-in-down">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-bold text-gray-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button variant="link" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
                Marcar todas como leídas
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.leido ? 'bg-blue-50' : ''}`}
                >
                  <p className="text-sm text-gray-700">{n.mensaje}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(n.fecha_creacion)}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No tienes notificaciones.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
