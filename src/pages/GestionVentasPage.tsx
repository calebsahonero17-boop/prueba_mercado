import React from 'react';
import { useVendedorPedidos, PedidoVendedor } from '../hooks/useVendedorPedidos';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Card, Button } from '../components/ui';
import { Spinner } from '../components/ui/Spinner';
import { AlertCircle, ArrowLeft, Check, Eye, Package, X } from 'lucide-react';

interface GestionVentasPageProps {
  onNavigate: (page: string) => void;
}

const EstadoPagoBadge: React.FC<{ estado: string | null }> = ({ estado }) => {
  const baseClasses = 'px-3 py-1 text-xs font-medium rounded-full border';
  switch (estado) {
    case 'pagado':
      return <span className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}>Pagado</span>;
    case 'en_verificacion':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`}>En Verificación</span>;
    case 'rechazado':
      return <span className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>Rechazado</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>No Pagado</span>;
  }
};

const PedidoCard: React.FC<{ pedido: PedidoVendedor; onAction: any }> = ({ pedido, onAction }) => {
  const necesitaVerificacion = pedido.estado_pago === 'en_verificacion';

  return (
    <Card variant="outline" padding="md" className={necesitaVerificacion ? 'border-2 border-yellow-400' : ''}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Info Pedido */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">#{pedido.numero_pedido}</span>
            <EstadoPagoBadge estado={pedido.estado_pago} />
          </div>
          <p className="text-sm text-gray-600">Comprador: <span className="font-medium text-gray-800">{pedido.comprador?.nombres} {pedido.comprador?.apellidos}</span></p>
          <p className="text-sm text-gray-600">Fecha: <span className="font-medium text-gray-800">{new Date(pedido.fecha_creacion).toLocaleDateString('es-BO')}</span></p>
          <p className="text-lg font-bold">Total: Bs {pedido.total.toFixed(2)}</p>
        </div>

        {/* Info Comprador */}
        <div className="text-sm">
          <h4 className="font-semibold mb-1">Datos de Envío</h4>
          <p className="text-gray-700">{pedido.direccion_envio}</p>
          <p className="text-gray-600">Tel: {pedido.telefono_contacto}</p>
        </div>

        {/* Acciones */}
        <div className="flex flex-col items-end gap-2">
          {pedido.comprobante_pago_url && (
            <Button 
              variant="outline" 
              size="sm" 
              icon={Eye} 
              onClick={() => onAction.verComprobante(pedido.comprobante_pago_url)}
            >
              Ver Comprobante
            </Button>
          )}
          {necesitaVerificacion && (
            <div className="flex gap-2">
              <Button 
                variant="success" 
                size="sm" 
                icon={Check} 
                onClick={() => onAction.aprobarPago(pedido.id)}
              >
                Aprobar
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                icon={X} 
                onClick={() => onAction.rechazarPago(pedido.id)}
              >
                Rechazar
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

function GestionVentasPage({ onNavigate }: GestionVentasPageProps) {
  const { user, isAuthenticated } = useSupabaseAuth();
  const { pedidos, cargando, error, ...actions } = useVendedorPedidos();

  if (!isAuthenticated) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold">Acceso denegado</h2>
        <p className="text-gray-600">Debes ser un vendedor para ver esta página.</p>
        <Button onClick={() => onNavigate('login')} className="mt-4">Iniciar Sesión</Button>
      </div>
    );
  }

  if (cargando) {
    return <Spinner message="Cargando tus ventas..." />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <AlertCircle className="mx-auto w-12 h-12" />
        <h2 className="mt-4 text-xl font-bold">Error al cargar las ventas</h2>
        <p>{error}</p>
      </div>
    );
  }

  const pedidosEnVerificacion = pedidos.filter(p => p.estado_pago === 'en_verificacion');
  const otrosPedidos = pedidos.filter(p => p.estado_pago !== 'en_verificacion');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => onNavigate('home')}>
            Inicio
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
            <p className="text-gray-600">Hola {user?.nombres}, aquí puedes gestionar tus pedidos.</p>
          </div>
        </div>

        {pedidos.length === 0 ? (
          <Card className="text-center p-12">
            <Package className="mx-auto w-16 h-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-bold">Aún no tienes ventas</h3>
            <p className="mt-2 text-gray-600">Cuando un cliente realice un pedido, aparecerá aquí.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {pedidosEnVerificacion.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Pedidos por Verificar</h2>
                <div className="space-y-4">
                  {pedidosEnVerificacion.map(pedido => (
                    <PedidoCard key={pedido.id} pedido={pedido} onAction={actions} />
                  ))}
                </div>
              </div>
            )}
            
            {otrosPedidos.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Historial de Pedidos</h2>
                <div className="space-y-4">
                  {otrosPedidos.map(pedido => (
                    <PedidoCard key={pedido.id} pedido={pedido} onAction={actions} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionVentasPage;
