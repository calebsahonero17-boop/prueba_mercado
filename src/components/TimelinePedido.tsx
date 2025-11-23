import React from 'react';
import { Clock, CheckCircle, Package, Truck, Home, X } from 'lucide-react';
import { EstadoPedido } from '../types/product';

interface TimelinePedidoProps {
  estadoActual: EstadoPedido;
  fechaCreacion: string;
  fechaEnvio?: string;
  fechaEntrega?: string;
  numeroPedido: string;
}

interface EtapaTimeline {
  estado: EstadoPedido;
  titulo: string;
  descripcion: string;
  icono: React.ElementType;
}

function TimelinePedido({
  estadoActual,
  fechaCreacion,
  fechaEnvio,
  fechaEntrega,
  numeroPedido
}: TimelinePedidoProps) {

  const etapas: EtapaTimeline[] = [
    {
      estado: 'pendiente',
      titulo: 'Pedido Recibido',
      descripcion: 'Hemos recibido tu pedido y lo estamos revisando',
      icono: Clock
    },
    {
      estado: 'confirmado',
      titulo: 'Pedido Confirmado',
      descripcion: 'Tu pedido ha sido confirmado y está en cola de preparación',
      icono: CheckCircle
    },
    {
      estado: 'procesando',
      titulo: 'Preparando Pedido',
      descripcion: 'Estamos preparando tus productos para el envío',
      icono: Package
    },
    {
      estado: 'enviado',
      titulo: 'En Camino',
      descripcion: 'Tu pedido está en camino hacia tu dirección',
      icono: Truck
    },
    {
      estado: 'entregado',
      titulo: 'Entregado',
      descripcion: '¡Tu pedido ha sido entregado exitosamente!',
      icono: Home
    }
  ];

  // Si está cancelado, mostrar solo la etapa de cancelación
  if (estadoActual === 'cancelado') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Pedido Cancelado</h3>
            <p className="text-red-600 text-sm">Pedido #{numeroPedido}</p>
          </div>
        </div>
        <p className="text-red-700">
          Este pedido ha sido cancelado. Si tienes preguntas, contáctanos.
        </p>
      </div>
    );
  }

  const obtenerEstadosOrdenados = () => {
    const orden = ['pendiente', 'confirmado', 'procesando', 'enviado', 'entregado'];
    return orden.indexOf(estadoActual);
  };

  const estadoActualIndex = obtenerEstadosOrdenados();

  const obtenerFechaEtapa = (estado: EstadoPedido): string | null => {
    switch (estado) {
      case 'pendiente':
        return fechaCreacion;
      case 'enviado':
        return fechaEnvio || null;
      case 'entregado':
        return fechaEntrega || null;
      default:
        return null;
    }
  };

  const formatearFecha = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Seguimiento del Pedido #{numeroPedido}
      </h3>

      <div className="relative">
        {etapas.map((etapa, index) => {
          const EtapaIcon = etapa.icono;
          const estaCompleta = index <= estadoActualIndex;
          const esActual = index === estadoActualIndex;
          const fechaEtapa = obtenerFechaEtapa(etapa.estado);

          return (
            <div key={etapa.estado} className="relative pb-8 last:pb-0">
              {/* Línea conectora */}
              {index < etapas.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-8 ${
                    estaCompleta ? 'bg-green-400' : 'bg-gray-300'
                  }`}
                />
              )}

              {/* Contenido de la etapa */}
              <div className="flex items-start gap-4">
                {/* Ícono */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    estaCompleta
                      ? 'bg-green-100 border-green-400 text-green-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  } ${esActual ? 'ring-4 ring-blue-100 border-blue-400 bg-blue-100 text-blue-600' : ''}`}
                >
                  <EtapaIcon className="w-5 h-5" />
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-medium ${
                        estaCompleta ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {etapa.titulo}
                    </h4>
                    {fechaEtapa && (
                      <span className="text-xs text-gray-500">
                        {formatearFecha(fechaEtapa)}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm mt-1 ${
                      estaCompleta ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {etapa.descripcion}
                  </p>

                  {/* Información adicional para el estado actual */}
                  {esActual && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">
                        {estadoActual === 'pendiente' && '⏳ Revisando tu pedido...'}
                        {estadoActual === 'confirmado' && '✅ ¡Pedido confirmado! Comenzando preparación.'}
                        {estadoActual === 'procesando' && '📦 Preparando tus productos con cuidado.'}
                        {estadoActual === 'enviado' && '🚚 En camino hacia tu dirección.'}
                        {estadoActual === 'entregado' && '🎉 ¡Disfruta tu pedido!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barra de progreso */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progreso del pedido</span>
          <span>{Math.round(((estadoActualIndex + 1) / etapas.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((estadoActualIndex + 1) / etapas.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default TimelinePedido;