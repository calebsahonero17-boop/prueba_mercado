import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Pedido, EstadoPedido, EstadoPago } from '../types/product';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';

// Extendemos el tipo Pedido para incluir la información del comprador
export type PedidoVendedor = Pedido & {
  comprador: {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
  } | null;
};

export function useVendedorPedidos() {
  const [pedidos, setPedidos] = useState<PedidoVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useSupabaseAuth();
  const toast = useToast();

  const cargarPedidosVendedor = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPedidos([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('pedidos')
        .select(`
          *,
          comprador:usuario_id (id, nombres, apellidos, email),
          detalles:detalle_pedidos(*, producto:productos(nombre))
        `)
        .eq('vendedor_id', user.id)
        .order('fecha_creacion', { ascending: false });

      if (fetchError) {
        throw new Error(`Error al cargar los pedidos: ${fetchError.message}`);
      }

      setPedidos(data as PedidoVendedor[] || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setCargando(false);
    }
  }, [user, isAuthenticated, toast]);

  useEffect(() => {
    cargarPedidosVendedor();
  }, [cargarPedidosVendedor]);

  const actualizarEstadoPago = async (pedidoId: string, estado_pago: EstadoPago, estado_pedido?: EstadoPedido) => {
    const updates: Partial<Pedido> = { estado_pago };
    if (estado_pedido) {
      updates.estado = estado_pedido;
    }

    const { error: updateError } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', pedidoId);

    if (updateError) {
      toast.error(`Error al actualizar el pedido: ${updateError.message}`);
      return false;
    }

    // Actualizar el estado localmente
    setPedidos(prevPedidos =>
      prevPedidos.map(p => (p.id === pedidoId ? { ...p, ...updates } : p))
    );
    toast.success(`El pedido ha sido actualizado.`);
    return true;
  };

  const aprobarPago = (pedidoId: string) => {
    return actualizarEstadoPago(pedidoId, 'pagado', 'confirmado');
  };

  const rechazarPago = (pedidoId: string) => {
    return actualizarEstadoPago(pedidoId, 'rechazado');
  };

  const verComprobante = async (path: string) => {
    try {
      const { data, error: urlError } = await supabase.storage
        .from('comprobantes')
        .createSignedUrl(path, 300); // URL válida por 5 minutos

      if (urlError) throw urlError;
      
      window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      toast.error(`No se pudo mostrar el comprobante: ${error.message}`);
    }
  };

  return {
    pedidos,
    cargando,
    error,
    refrescar: cargarPedidosVendedor,
    aprobarPago,
    rechazarPago,
    verComprobante,
  };
}
