import React, { useState } from 'react';
import {
  ArrowLeft,
  Package,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  RefreshCw,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useMisPedidos } from '../hooks/useMisPedidos';
import { Pedido, EstadoPedido } from '../types/product';
import TimelinePedido from '../components/TimelinePedido';

interface MisPedidosPageProps {
  onNavigate: (page: string) => void;
}

function MisPedidosPage({ onNavigate }: MisPedidosPageProps) {
  const { user, isAuthenticated } = useSupabaseAuth();
  const {
    pedidos,
    cargando,
    error,
    obtenerEstadisticasUsuario,
    obtenerNombreEstado,
    obtenerColorEstado,
    obtenerDescripcionEstado,
    refrescar
  } = useMisPedidos();

  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Inicia Sesión</h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para ver tus pedidos.
          </p>
          <Button variant="primary" fullWidth onClick={() => onNavigate('login')}>
            Iniciar Sesión
          </Button>
        </Card>
      </div>
    );
  }

  const estadisticas = obtenerEstadisticasUsuario();

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const coincideBusqueda = (
      pedido.numero_pedido.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      pedido.detalles?.some(detalle =>
        detalle.producto?.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase())
      )
    );

    const coincideEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const estadosDisponibles: EstadoPedido[] = [
    'pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado'
  ];

  const calcularTotalProductos = (pedido: Pedido): number => {
    return pedido.detalles?.reduce((acc, detalle) => acc + detalle.cantidad, 0) || 0;
  };

  const obtenerIconoEstado = (estado: EstadoPedido) => {
    const iconos = {
      pendiente: Clock,
      confirmado: CheckCircle,
      procesando: Package,
      enviado: Truck,
      entregado: CheckCircle,
      cancelado: AlertCircle
    };
    return iconos[estado] || Clock;
  };

  // Vista detalle del pedido
  if (pedidoSeleccionado) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Encabezado */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => setPedidoSeleccionado(null)}
            >
              Volver a Mis Pedidos
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedido #{pedidoSeleccionado.numero_pedido}
              </h1>
              <p className="text-gray-600">
                Realizado el {new Date(pedidoSeleccionado.fecha_creacion).toLocaleDateString('es-BO')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline del pedido */}
            <div className="lg:col-span-2">
              <TimelinePedido
                estadoActual={pedidoSeleccionado.estado}
                fechaCreacion={pedidoSeleccionado.fecha_creacion}
                fechaEnvio={pedidoSeleccionado.fecha_envio}
                fechaEntrega={pedidoSeleccionado.fecha_entrega}
                numeroPedido={pedidoSeleccionado.numero_pedido}
              />
            </div>

            {/* Detalles del pedido */}
            <div className="space-y-6">
              {/* Resumen */}
              <Card variant="elevated" padding="lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(pedidoSeleccionado.estado)}`}>
                      {obtenerNombreEstado(pedidoSeleccionado.estado)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">Bs {pedidoSeleccionado.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Productos:</span>
                    <span className="text-gray-900">{calcularTotalProductos(pedidoSeleccionado)}</span>
                  </div>
                </div>
              </Card>

              {/* Información de envío */}
              {pedidoSeleccionado.direccion_envio && (
                <Card variant="elevated" padding="lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Dirección de Envío</h3>
                  <p className="text-gray-700 text-sm">{pedidoSeleccionado.direccion_envio}</p>
                  {pedidoSeleccionado.telefono_contacto && (
                    <p className="text-gray-600 text-sm mt-2">
                      Teléfono: {pedidoSeleccionado.telefono_contacto}
                    </p>
                  )}
                </Card>
              )}

              {/* Productos */}
              <Card variant="elevated" padding="lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Productos</h3>
                <div className="space-y-3">
                  {pedidoSeleccionado.detalles?.map((detalle) => (
                    <div key={detalle.id} className="flex items-center gap-3">
                      <img
                        src={detalle.producto?.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60'}
                        alt={detalle.producto?.nombre}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{detalle.producto?.nombre}</p>
                        <p className="text-gray-600 text-xs">
                          {detalle.cantidad} x Bs {detalle.precio_unitario}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">
                        Bs {detalle.subtotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal de mis pedidos
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Encabezado */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" icon={ArrowLeft} onClick={() => onNavigate('home')}>
                Inicio
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
                <p className="text-gray-600">
                  Hola {user.nombres}, aquí puedes ver todos tus pedidos y su estado
                </p>
              </div>
            </div>
            <Button variant="outline" icon={RefreshCw} onClick={refrescar} disabled={cargando}>
              Actualizar
            </Button>
          </div>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalPedidos}</p>
                <p className="text-sm text-gray-600">Total Pedidos</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.pedidosEntregados}</p>
                <p className="text-sm text-gray-600">Entregados</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.pedidosEnProceso}</p>
                <p className="text-sm text-gray-600">En Proceso</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Bs {estadisticas.totalGastado.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Gastado</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card variant="elevated" padding="md" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Buscar por número de pedido o producto..."
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              icon={Search}
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | 'todos')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
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
              Tus Pedidos ({pedidosFiltrados.length})
            </h3>
          </div>

          {cargando ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando tus pedidos...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <Button variant="outline" onClick={refrescar} className="mt-4">
                Reintentar
              </Button>
            </div>
          ) : pedidosFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {pedidos.length === 0 ? 'No tienes pedidos aún' : 'No se encontraron pedidos'}
              </h3>
              <p className="text-gray-600 mb-6">
                {pedidos.length === 0
                  ? 'Explora nuestros productos y realiza tu primera compra'
                  : 'Intenta cambiar los filtros de búsqueda'
                }
              </p>
              {pedidos.length === 0 && (
                <Button variant="primary" onClick={() => onNavigate('buy')}>
                  Explorar Productos
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pedidosFiltrados.map((pedido) => {
                const IconoEstado = obtenerIconoEstado(pedido.estado);
                const totalProductos = calcularTotalProductos(pedido);

                return (
                  <div key={pedido.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <IconoEstado className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-lg text-gray-900">
                              #{pedido.numero_pedido}
                            </span>
                          </div>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${obtenerColorEstado(pedido.estado)}`}>
                            {obtenerNombreEstado(pedido.estado)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(pedido.fecha_creacion).toLocaleDateString('es-BO')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span>{totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">Bs {pedido.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mt-2">
                          {obtenerDescripcionEstado(pedido.estado)}
                        </p>
                      </div>

                      <div className="ml-6">
                        <Button
                          variant="outline"
                          icon={Eye}
                          onClick={() => setPedidoSeleccionado(pedido)}
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default MisPedidosPage;