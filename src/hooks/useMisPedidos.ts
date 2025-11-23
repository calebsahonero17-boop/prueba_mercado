import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Pedido, EstadoPedido } from '../types/product';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';

export function useMisPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useSupabaseAuth();
  const toast = useToast();

  // Referencias para evitar bucles infinitos
  const lastUserIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // Detectar si estamos en modo demo
  const isDemoMode = user?.id === 'demo-user';

  // Función para obtener pedidos demo desde localStorage
  const obtenerPedidosDemo = (): Pedido[] => {
    try {
      const pedidosGuardados = localStorage.getItem('demo-pedidos');
      return pedidosGuardados ? JSON.parse(pedidosGuardados) : [];
    } catch {
      return [];
    }
  };

  // Cargar pedidos del usuario actual con useCallback para evitar bucles
  const cargarMisPedidos = useCallback(async () => {
    console.log('🔄 cargarMisPedidos llamado para:', user?.id);

    // Evitar bucles infinitos
    if (isLoadingRef.current) {
      console.log('⚠️ Ya hay una carga en progreso, saltando...');
      return;
    }

    // Si no cambió el usuario, no recargar
    if (user?.id === lastUserIdRef.current && lastUserIdRef.current !== null) {
      console.log('👤 Usuario no cambió, saltando...');
      return;
    }

    if (!isAuthenticated || !user) {
      console.log('❌ No autenticado o sin usuario');
      setPedidos([]);
      setCargando(false);
      lastUserIdRef.current = null;
      return;
    }

    try {
      console.log('📦 useMisPedidos: Cargando pedidos del usuario:', user.id);
      isLoadingRef.current = true;
      lastUserIdRef.current = user.id;
      setCargando(true);
      setError(null);

      if (isDemoMode) {
        console.log('🧪 Modo demo: Cargando mis pedidos desde localStorage');
        await new Promise(resolve => setTimeout(resolve, 500));
        const pedidosDemo = obtenerPedidosDemo();
        console.log('🧪 Mis pedidos demo encontrados:', pedidosDemo.length);
        setPedidos(pedidosDemo);
        setCargando(false);
        return;
      }

      console.log('⚡ Usando cliente Supabase principal para cargar pedidos...');

      // Crear timeout de respaldo por si la conexión es muy lenta
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout cargando pedidos - conexión muy lenta')), 12000);
      });

      const pedidosPromise = supabase
        .from('pedidos')
        .select(`
          *,
          detalles:detalle_pedidos(
            *,
            producto:productos(nombre, precio, url_imagen, categoria)
          )
        `)
        .eq('usuario_id', user.id)
        .order('fecha_creacion', { ascending: false });

      const { data: pedidosData, error: errorPedidos } = await Promise.race([
        pedidosPromise,
        timeoutPromise
      ]);

      if (errorPedidos) {
        console.error('❌ useMisPedidos: Error cargando pedidos:', errorPedidos);
        setError('Error al cargar tus pedidos');
        toast.error('Error al cargar tus pedidos');
        return;
      }

      console.log('📦 useMisPedidos: Pedidos obtenidos:', pedidosData);
      setPedidos(pedidosData || []);

    } catch (err: any) {
      console.error('❌ useMisPedidos: Error:', err);

      if (err.message?.includes('Timeout') || err.message?.includes('timeout')) {
        console.log('⏰ Timeout detectado en carga de pedidos');
        setError('La conexión está muy lenta. Los pedidos pueden no estar actualizados.');
        toast.error('Conexión lenta - Los pedidos pueden no cargar completamente', 'Timeout de Red');

        // Mostrar datos demo como fallback en caso de timeout
        console.log('🔄 Mostrando mensaje de fallback para usuario real...');
        setPedidos([]); // Mantener lista vacía pero sin error crítico
      } else {
        setError('Error al cargar tus pedidos - revisa tu conexión');
        toast.error('Error al cargar tus pedidos - verifica tu conexión a internet');
      }
    } finally {
      isLoadingRef.current = false;
      setCargando(false);
    }
  }, [user, isAuthenticated, isDemoMode, toast]);

  // Obtener estadísticas básicas del usuario
  const obtenerEstadisticasUsuario = () => {
    const totalPedidos = pedidos.length;
    const pedidosEntregados = pedidos.filter(p => p.estado === 'entregado').length;
    const pedidosEnProceso = pedidos.filter(p =>
      ['pendiente', 'confirmado', 'procesando', 'enviado'].includes(p.estado)
    ).length;
    const totalGastado = pedidos
      .filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + p.total, 0);

    return {
      totalPedidos,
      pedidosEntregados,
      pedidosEnProceso,
      totalGastado
    };
  };

  // Obtener pedido por número
  const obtenerPedidoPorNumero = (numeroPedido: string): Pedido | undefined => {
    return pedidos.find(p => p.numero_pedido === numeroPedido);
  };

  // Función helper para obtener nombre legible del estado
  const obtenerNombreEstado = (estado: EstadoPedido): string => {
    const nombres = {
      pendiente: 'Pendiente de Confirmación',
      confirmado: 'Confirmado',
      procesando: 'Preparando Pedido',
      enviado: 'En Camino',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return nombres[estado] || estado;
  };

  // Función helper para obtener color del estado
  const obtenerColorEstado = (estado: EstadoPedido): string => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmado: 'bg-blue-100 text-blue-800 border-blue-200',
      procesando: 'bg-orange-100 text-orange-800 border-orange-200',
      enviado: 'bg-purple-100 text-purple-800 border-purple-200',
      entregado: 'bg-green-100 text-green-800 border-green-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Función helper para obtener descripción del estado
  const obtenerDescripcionEstado = (estado: EstadoPedido): string => {
    const descripciones = {
      pendiente: 'Tu pedido está siendo revisado por nuestro equipo',
      confirmado: 'Hemos confirmado tu pedido y pronto comenzaremos a prepararlo',
      procesando: 'Estamos preparando tus productos para el envío',
      enviado: 'Tu pedido está en camino. Pronto lo recibirás',
      entregado: '¡Tu pedido ha sido entregado exitosamente!',
      cancelado: 'Este pedido ha sido cancelado'
    };
    return descripciones[estado] || 'Estado del pedido';
  };

  // Función para calcular progreso del pedido (0-100%)
  const calcularProgresoPedido = (estado: EstadoPedido): number => {
    const progreso = {
      pendiente: 10,
      confirmado: 25,
      procesando: 50,
      enviado: 75,
      entregado: 100,
      cancelado: 0
    };
    return progreso[estado] || 0;
  };

  // Función de refrescar manual que ignora las optimizaciones
  const refrescarPedidos = useCallback(async () => {
    console.log('🔄 Refrescar manual solicitado');
    lastUserIdRef.current = null; // Resetear para forzar carga
    isLoadingRef.current = false; // Resetear flag de carga
    await cargarMisPedidos();
  }, [cargarMisPedidos]);

  // Cargar pedidos cuando cambie el usuario (solo ID para evitar bucles)
  useEffect(() => {
    console.log('🔄 useEffect triggered por cambio en userId:', user?.id);
    cargarMisPedidos();
  }, [user?.id, cargarMisPedidos]);

  return {
    pedidos,
    cargando,
    error,
    cargarMisPedidos: refrescarPedidos,
    obtenerEstadisticasUsuario,
    obtenerPedidoPorNumero,
    obtenerNombreEstado,
    obtenerColorEstado,
    obtenerDescripcionEstado,
    calcularProgresoPedido,
    refrescar: refrescarPedidos
  };
}