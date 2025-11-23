import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pedido, DetallePedido, EstadoPedido, CrearPedidoData, EstadisticasPedidos } from '../types/product';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const { user } = useSupabaseAuth();

  // Detectar si estamos en modo demo
  const isDemoMode = user?.id === 'demo-user';

  // Funciones para manejar pedidos demo en localStorage
  const obtenerPedidosDemo = (): Pedido[] => {
    try {
      const pedidosGuardados = localStorage.getItem('demo-pedidos');
      return pedidosGuardados ? JSON.parse(pedidosGuardados) : [];
    } catch {
      return [];
    }
  };

  const guardarPedidoDemo = (pedido: Pedido) => {
    try {
      const pedidosExistentes = obtenerPedidosDemo();
      const nuevoPedidos = [pedido, ...pedidosExistentes];
      localStorage.setItem('demo-pedidos', JSON.stringify(nuevoPedidos));
    } catch (error) {
      console.error('Error guardando pedido demo:', error);
    }
  };

  // Cargar todos los pedidos con detalles
  const cargarPedidos = async () => {
    try {
      console.log('📦 usePedidos: Iniciando carga de pedidos...');
      setCargando(true);
      setError(null);

      if (isDemoMode) {
        console.log('🧪 Modo demo: Cargando pedidos desde localStorage');
        await new Promise(resolve => setTimeout(resolve, 500));
        const pedidosDemo = obtenerPedidosDemo();
        console.log('🧪 Pedidos demo encontrados:', pedidosDemo.length);
        setPedidos(pedidosDemo);
        setCargando(false);
        return;
      }

      console.log('⚡ Usando cliente Supabase principal para cargar todos los pedidos...');

      const pedidosPromise = supabase
        .from('pedidos')
        .select(`
          *,
          detalles:detalle_pedidos(
            *,
            producto:productos(nombre, precio, url_imagen, categoria)
          )
        `)
        .order('fecha_creacion', { ascending: false });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout cargando pedidos admin - conexión muy lenta')), 15000);
      });

      const { data: pedidosData, error: errorPedidos } = await Promise.race([
        pedidosPromise,
        timeoutPromise
      ]);

      if (errorPedidos) {
        console.error('❌ usePedidos: Error cargando pedidos:', errorPedidos);
        setError('Error al cargar pedidos');
        return;
      }

      console.log('📦 usePedidos: Pedidos obtenidos desde DB:', pedidosData);

      // Obtener información de usuarios para cada pedido
      if (pedidosData && pedidosData.length > 0) {
        console.log('👥 Cargando usuarios de pedidos...');

        const pedidosConUsuarios = await Promise.all(
          pedidosData.map(async (pedido) => {
            try {
              const { data: usuario } = await supabase
                .from('perfiles')
                .select('nombres, apellidos, carnet_identidad')
                .eq('id', pedido.usuario_id)
                .single();

              return {
                ...pedido,
                usuario
              };
            } catch (err) {
              console.warn('⚠️ Error cargando usuario:', pedido.usuario_id, err);
              return {
                ...pedido,
                usuario: {
                  nombres: 'Usuario',
                  apellidos: 'No disponible',
                  carnet_identidad: 'N/A'
                }
              };
            }
          })
        );
        console.log('📦 usePedidos: Pedidos con usuarios:', pedidosConUsuarios);
        setPedidos(pedidosConUsuarios);
      } else {
        console.log('📦 usePedidos: No hay pedidos para mostrar');
        setPedidos([]);
      }
    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setError('Error al cargar pedidos');
    } finally {
      setCargando(false);
    }
  };

  // Crear nuevo pedido
  const crearPedido = async (datoPedido: CrearPedidoData, usuarioId: string, vendedorId: string, estado: EstadoPedido = 'pendiente'): Promise<Pedido | null> => {
    try {
      console.log('🛒 Creando nuevo pedido...');

      // Calcular totales
      const subtotal = datoPedido.items.reduce((acc, item) =>
        acc + (item.precio_unitario * item.cantidad), 0
      );
      const total = subtotal; // Aquí podrías agregar impuestos, envío, etc.

      if (isDemoMode) {
        console.log('🧪 Modo demo: Simulando creación de pedido');

        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Crear pedido demo
        const pedidoDemo: Pedido = {
          id: `demo-pedido-${Date.now()}`,
          numero_pedido: `ME-DEMO-${Date.now().toString().slice(-6)}`,
          usuario_id: usuarioId,
          estado: 'pendiente',
          total,
          subtotal,
          direccion_envio: datoPedido.direccion_envio,
          telefono_contacto: datoPedido.telefono_contacto,
          fecha_creacion: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          fecha_envio: null,
          fecha_entrega: null,
          notas: datoPedido.notas_cliente || null,
          detalles: datoPedido.items.map(item => ({
            id: `demo-detalle-${Date.now()}-${item.producto_id}`,
            pedido_id: `demo-pedido-${Date.now()}`,
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.precio_unitario * item.cantidad,
            fecha_creacion: new Date().toISOString(),
            producto: null // En modo demo no necesitamos cargar el producto
          }))
        };

        console.log('✅ Pedido demo creado exitosamente:', pedidoDemo.numero_pedido);

        // Guardar el pedido en localStorage
        guardarPedidoDemo(pedidoDemo);
        console.log('💾 Pedido demo guardado en localStorage');

        // Actualizar la lista de pedidos
        const pedidosActualizados = obtenerPedidosDemo();
        setPedidos(pedidosActualizados);

        toast.success(`Pedido ${pedidoDemo.numero_pedido} creado exitosamente`);

        return pedidoDemo;
      }

      console.log('🛒 Creando pedido para usuario:', usuarioId);
      console.log('⚡ Usando cliente Supabase principal para crear pedido...');

      // Crear el pedido principal
      console.log('📝 Insertando pedido en la base de datos...');

      // Inserción simplificada con solo las columnas esenciales
      const pedidoPromise = supabase
        .from('pedidos')
        .insert({
          usuario_id: usuarioId,
          vendedor_id: vendedorId, // Añadido
          total: total,
          direccion_envio: datoPedido.direccion_envio,
          telefono_contacto: datoPedido.telefono_contacto,
          estado: estado
        })
        .select()
        .single();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout creando pedido - conexión muy lenta')), 18000);
      });

      const { data: pedidoData, error: errorPedido } = await Promise.race([
        pedidoPromise,
        timeoutPromise
      ]);

      if (errorPedido) {
        console.error('❌ Error creando pedido:', errorPedido);
        console.error('❌ Detalles del error:', errorPedido.message);
        console.error('❌ Código del error:', errorPedido.code);
        console.error('❌ Hint del error:', errorPedido.hint);
        console.error('❌ Detalles completos:', errorPedido.details);

        // Mensaje de error más específico según el código
        let mensajeError = 'Error al crear el pedido';
        if (errorPedido.code === '23505') {
          mensajeError = 'Error de duplicado en los datos';
        } else if (errorPedido.code === '23503') {
          mensajeError = 'Error de referencia en los datos';
        } else if (errorPedido.code === 'PGRST301') {
          mensajeError = 'Error de permisos - verifica tu sesión';
        }

        throw new Error(`${mensajeError}: ${errorPedido.message}`);
      }

      if (!pedidoData) {
        console.error('❌ No se recibió data del pedido creado');
        throw new Error('No se pudo crear el pedido - respuesta vacía');
      }

      console.log('✅ Pedido principal creado:', pedidoData.numero_pedido);

      // Crear los detalles del pedido
      console.log('📋 Creando detalles del pedido...');
      const detallesParaInsertar = datoPedido.items.map(item => ({
        pedido_id: pedidoData.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.precio_unitario * item.cantidad
      }));

      console.log('📦 Detalles a insertar:', detallesParaInsertar);

      const detallesPromise = supabase
        .from('detalle_pedidos')
        .insert(detallesParaInsertar)
        .select();

      const detallesTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout creando detalles - conexión muy lenta')), 10000);
      });

      const { data: detallesData, error: errorDetalles } = await Promise.race([
        detallesPromise,
        detallesTimeoutPromise
      ]);

      if (errorDetalles) {
        console.error('❌ Error creando detalles:', errorDetalles);
        console.error('❌ Detalles del error:', errorDetalles.message);
        console.error('❌ Código del error:', errorDetalles.code);

        // Eliminar el pedido si falló la creación de detalles
        console.log('🧹 Eliminando pedido debido a falla en detalles...');
        await supabase.from('pedidos').delete().eq('id', pedidoData.id);

        let mensajeError = 'Error al crear los detalles del pedido';
        if (errorDetalles.code === '23503') {
          mensajeError = 'Uno o más productos no existen';
        }

        throw new Error(`${mensajeError}: ${errorDetalles.message}`);
      }

      console.log('✅ Detalles creados exitosamente:', detallesData?.length, 'items');

      console.log('✅ Pedido creado exitosamente:', pedidoData.numero_pedido);
      toast.success(`Pedido ${pedidoData.numero_pedido} creado exitosamente`);

      // Recargar pedidos
      await cargarPedidos();

      return pedidoData;
    } catch (err) {
      console.error('Error en crearPedido:', err);
      toast.error(err instanceof Error ? err.message : 'Error al crear el pedido');
      return null;
    }
  };

  // Cambiar estado de pedido
  const cambiarEstadoPedido = async (pedidoId: string, nuevoEstado: EstadoPedido, notasAdmin?: string): Promise<boolean> => {
    try {
      console.log(`📦 Cambiando estado del pedido ${pedidoId} a ${nuevoEstado}`);

      const actualizacion: any = {
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString()
      };

      // Agregar fechas específicas según el estado
      if (nuevoEstado === 'enviado') {
        actualizacion.fecha_envio = new Date().toISOString();
      } else if (nuevoEstado === 'entregado') {
        actualizacion.fecha_entrega = new Date().toISOString();
      }

      // Comentar notas_admin por ahora hasta confirmar estructura de BD
      // if (notasAdmin) {
      //   actualizacion.notas_admin = notasAdmin;
      // }

      console.log('⚡ Actualizando estado...');
      const { error } = await supabase
        .from('pedidos')
        .update(actualizacion)
        .eq('id', pedidoId);

      if (error) {
        console.error('Error actualizando estado:', error);
        throw new Error('Error al actualizar el estado del pedido');
      }

      toast.success(`Estado actualizado a: ${obtenerNombreEstado(nuevoEstado)}`);

      // Recargar pedidos
      await cargarPedidos();

      return true;
    } catch (err) {
      console.error('Error en cambiarEstadoPedido:', err);
      toast.error(err instanceof Error ? err.message : 'Error al cambiar el estado');
      return false;
    }
  };

  // Obtener estadísticas de pedidos
  const obtenerEstadisticasPedidos = async (): Promise<EstadisticasPedidos | null> => {
    try {
      console.log('⚡ Obteniendo estadísticas...');

      // Total de pedidos
      const { count: totalPedidos } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true });

      // Pedidos por estado
      const { data: estadosData } = await supabase
        .from('pedidos')
        .select('estado')
        .not('estado', 'eq', 'cancelado');

      // Ventas totales
      const { data: ventasData } = await supabase
        .from('pedidos')
        .select('total')
        .in('estado', ['entregado', 'enviado', 'procesando']);

      // Ventas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const { data: ventasHoyData } = await supabase
        .from('pedidos')
        .select('total')
        .gte('fecha_creacion', hoy)
        .in('estado', ['entregado', 'enviado', 'procesando']);

      // Calcular estadísticas
      const estadosPedidos = {
        pendiente: 0,
        confirmado: 0,
        procesando: 0,
        enviado: 0,
        entregado: 0,
        cancelado: 0
      };

      estadosData?.forEach(pedido => {
        estadosPedidos[pedido.estado as EstadoPedido]++;
      });

      const ventasTotales = ventasData?.reduce((acc, pedido) => acc + pedido.total, 0) || 0;
      const ventasHoy = ventasHoyData?.reduce((acc, pedido) => acc + pedido.total, 0) || 0;

      return {
        totalPedidos: totalPedidos || 0,
        pedidosPendientes: estadosPedidos.pendiente + estadosPedidos.confirmado,
        pedidosCompletados: estadosPedidos.entregado,
        ventasTotales,
        ventasHoy,
        ventasSemana: 0, // TODO: Implementar
        ventasMes: 0, // TODO: Implementar
        estadosPedidos
      };
    } catch (err) {
      console.error('Error obteniendo estadísticas:', err);
      return null;
    }
  };

  // Obtener pedidos de un usuario específico
  const obtenerPedidosUsuario = async (usuarioId: string): Promise<Pedido[]> => {
    try {
      console.log('⚡ Obteniendo pedidos de usuario...');

      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          detalles:detalle_pedidos(
            *,
            producto:productos(nombre, precio, url_imagen, categoria)
          )
        `)
        .eq('usuario_id', usuarioId)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error obteniendo pedidos del usuario:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error obteniendo pedidos del usuario:', err);
      return [];
    }
  };

  // Función helper para obtener nombre legible del estado
  const obtenerNombreEstado = (estado: EstadoPedido): string => {
    const nombres = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      procesando: 'Procesando',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return nombres[estado] || estado;
  };

  // Función helper para obtener color del estado
  const obtenerColorEstado = (estado: EstadoPedido): string => {
    const colores = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      procesando: 'bg-orange-100 text-orange-800',
      enviado: 'bg-purple-100 text-purple-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

  return {
    pedidos,
    cargando,
    error,
    cargarPedidos,
    crearPedido,
    cambiarEstadoPedido,
    obtenerEstadisticasPedidos,
    obtenerPedidosUsuario,
    obtenerNombreEstado,
    obtenerColorEstado,
    refrescar: cargarPedidos
  };
}