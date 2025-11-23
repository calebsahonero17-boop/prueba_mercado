
import React, { createContext, useContext } from 'react';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

interface ContextoMensajesNoLeidosType {
  contadorNoLeidos: number;
  refrescarContadorNoLeidos: () => void;
}

const ContextoMensajesNoLeidos = createContext<ContextoMensajesNoLeidosType | undefined>(undefined);

export const ProveedorMensajesNoLeidos: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { unreadCount: contadorNoLeidos, refreshUnreadCount: refrescarContadorNoLeidos } = useUnreadMessages();

  return (
    <ContextoMensajesNoLeidos.Provider value={{ contadorNoLeidos, refrescarContadorNoLeidos }}>
      {children}
    </ContextoMensajesNoLeidos.Provider>
  );
};

export const useContextoMensajesNoLeidos = () => {
  const context = useContext(ContextoMensajesNoLeidos);
  if (context === undefined) {
    throw new Error('useContextoMensajesNoLeidos debe ser usado dentro de un ProveedorMensajesNoLeidos');
  }
  return context;
};
