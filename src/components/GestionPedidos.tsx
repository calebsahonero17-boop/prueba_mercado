import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Eye,
  Edit3,
  Calendar,
  User,
  MapPin,
  Phone,
  MessageSquare,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { Button, Card, Input } from './ui';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermisos } from '../hooks/usePermisos';
import { usePedidos } from '../hooks/usePedidos';
import { Pedido, DetallePedido, EstadoPedido } from '../types/product';

interface GestionPedidosProps {
  actualizacionTrigger?: number;
}

function GestionPedidos({ actualizacionTrigger }: GestionPedidosProps) {
  const toast = useToast();
  const { user: usuarioActual } = useSupabaseAuth();
  const { puedeGestionarPedidos } = usePermisos(usuarioActual?.rol);
  const {
    pedidos,
    cargando,
    cambiarEstadoPedido,
    obtenerNombreEstado,
    obtenerColorEstado,
    refrescar
  } = usePedidos();

  console.log('🎯 GestionPedidos: Pedidos recibidos:', pedidos);
  console.log('🎯 GestionPedidos: Cargando:', cargando);

  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [estadoEditando, setEstadoEditando] = useState<EstadoPedido | null>(null);
  const [notasAdmin, setNotasAdmin] = useState('');
  const [procesando, setProcesando] = useState(false);

  const estadosDisponibles: EstadoPedido[] = [
    'pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado'
  ];

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const coincideBusqueda = (
      pedido.numero_pedido.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      pedido.usuario?.nombres?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      pedido.usuario?.apellidos?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      pedido.telefono_contacto?.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );

    const coincideEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  // Recargar cuando cambie el trigger
  useEffect(() => {
    if (actualizacionTrigger) {
      refrescar();
    }
  }, [actualizacionTrigger, refrescar]);

  const manejarCambioEstado = async () => {
    if (!pedidoSeleccionado || !estadoEditando) return;

    setProcesando(true);
    try {
      const exito = await cambiarEstadoPedido(
        pedidoSeleccionado.id,
        estadoEditando,
        notasAdmin || undefined
      );

      if (exito) {
        setPedidoSeleccionado(null);
        setEstadoEditando(null);
        setNotasAdmin('');
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    } finally {
      setProcesando(false);
    }
  };

  const abrirModalEstado = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setEstadoEditando(pedido.estado);
    setNotasAdmin(pedido.notas_admin || '');
  };

  const cerrarModal = () => {
    setPedidoSeleccionado(null);
    setEstadoEditando(null);
    setNotasAdmin('');
  };

  const calcularTotalProductos = (detalles?: DetallePedido[]): number => {
    return detalles?.reduce((acc, detalle) => acc + detalle.cantidad, 0) || 0;
  };

  const obtenerIconoEstado = (estado: EstadoPedido) => {
    const iconos = {
      pendiente: Clock,
      confirmado: CheckCircle,
      procesando: Package,
      enviado: Truck,
      entregado: CheckCircle,
      cancelado: X
    };
    return iconos[estado] || Clock;
  };

  if (!puedeGestionarPedidos) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h3>
        <p className="text-gray-600">No tienes permisos para gestionar pedidos.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>
            <p className="text-gray-600">Administra y haz seguimiento de todos los pedidos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card variant="elevated" padding="md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            placeholder="Buscar por número, cliente o teléfono..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            icon={Search}
          />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | 'todos')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos los estados</option>
            {estadosDisponibles.map(estado => (
              <option key={estado} value={estado}>
                {obtenerNombreEstado(estado)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Lista de pedidos */}
      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Pedidos ({pedidosFiltrados.length})
          </h3>
        </div>

        {cargando ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Cargando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pedidosFiltrados.map((pedido) => {
              const IconoEstado = obtenerIconoEstado(pedido.estado);
              const totalProductos = calcularTotalProductos(pedido.detalles);

              return (
                <div key={pedido.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Información principal */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <IconoEstado className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-lg text-gray-900">
                            {pedido.numero_pedido}
                          </span>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${obtenerColorEstado(pedido.estado)}`}>
                          {obtenerNombreEstado(pedido.estado)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900">
                            {pedido.usuario?.nombres} {pedido.usuario?.apellidos}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{pedido.telefono_contacto}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {new Date(pedido.fecha_creacion).toLocaleDateString('es-BO')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">
                            {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}
                          </span>
                        </div>
                      </div>

                      {pedido.direccion_envio && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-gray-600 text-sm">{pedido.direccion_envio}</span>
                        </div>
                      )}

                      {pedido.notas && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                          <span className="text-gray-600 text-sm italic">
                            "{pedido.notas}"
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Total y acciones */}
                    <div className="text-right space-y-3">
                      <div className="text-2xl font-bold text-gray-900">
                        Bs {pedido.total.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Edit3}
                          onClick={() => abrirModalEstado(pedido)}
                          disabled={procesando}
                        >
                          Cambiar Estado
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Productos del pedido */}
                  {pedido.detalles && pedido.detalles.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Productos:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {pedido.detalles.map((detalle) => (
                          <div key={detalle.id} className="flex items-center gap-2 text-sm">
                            <img
                              src={detalle.producto?.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40'}
                              alt={detalle.producto?.nombre}
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40';
                              }}
                            />
                            <span className="text-gray-900">
                              {detalle.cantidad}x {detalle.producto?.nombre}
                            </span>
                            <span className="text-gray-500">
                              Bs {detalle.precio_unitario}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal para cambiar estado */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Cambiar Estado - {pedidoSeleccionado.numero_pedido}
              </h3>
              <Button variant="ghost" size="sm" icon={X} onClick={cerrarModal} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado
                </label>
                <select
                  value={estadoEditando || ''}
                  onChange={(e) => setEstadoEditando(e.target.value as EstadoPedido)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={procesando}
                >
                  {estadosDisponibles.map(estado => (
                    <option key={estado} value={estado}>
                      {obtenerNombreEstado(estado)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas de Administración (opcional)
                </label>
                <textarea
                  value={notasAdmin}
                  onChange={(e) => setNotasAdmin(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Agregar notas internas..."
                  disabled={procesando}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  icon={Save}
                  onClick={manejarCambioEstado}
                  disabled={procesando || !estadoEditando}
                  className="flex-1"
                >
                  {procesando ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button
                  variant="outline"
                  onClick={cerrarModal}
                  disabled={procesando}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionPedidos;