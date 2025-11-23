import React, { useState } from 'react';
import { CreditCard, MapPin, Phone, MessageSquare, User, ArrowLeft, Loader } from 'lucide-react';
import { Card, Input } from './ui';
import Button from './ui/Button';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useCarritoSimple } from '../contexts/CarritoSimpleContext';

interface FormularioCheckoutProps {
  onVolver: () => void;
  onPedidoExitoso: (orderId: string) => void;
}

function FormularioCheckout({ onVolver, onPedidoExitoso }: FormularioCheckoutProps) {
  const toast = useToast();
  const { user } = useSupabaseAuth();
  const { items, total, crearPedidoDesdeCarrito } = useCarritoSimple();

  const [datosEnvio, setDatosEnvio] = useState({
    direccion_envio: '',
    telefono_contacto: user?.telefono || '',
    notas_cliente: ''
  });
  const [procesando, setProcesando] = useState(false);

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatosEnvio(prev => ({ ...prev, [name]: value }));
  };

  const manejarEnvioFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosEnvio.direccion_envio.trim() || !datosEnvio.telefono_contacto.trim()) {
      toast.error('Completa la dirección y el teléfono de contacto para continuar.');
      return;
    }

    setProcesando(true);
    const pedidoCreado = await crearPedidoDesdeCarrito(datosEnvio);
    
    if (pedidoCreado) {
      toast.success('¡Pedido realizado! Ahora, por favor, completa el pago.');
      // Navegamos a la página de confirmación con el ID del nuevo pedido
      onPedidoExitoso(pedidoCreado.id);
    } else {
      // El toast de error ya se muestra dentro de crearPedidoDesdeCarrito
      // Opcional: toast.error('No se pudo crear el pedido. Intenta nuevamente.');
    }
    setProcesando(false);
  };

  if (items.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold">Tu carrito está vacío</h2>
        <Button onClick={onVolver} className="mt-4">Volver a la tienda</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" icon={ArrowLeft} onClick={onVolver}>
          Volver al Carrito
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-600">Completa tu información para crear el pedido.</p>
        </div>
      </div>

      <form onSubmit={manejarEnvioFormulario} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna de Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Información de Envío
            </h3>
            <div className="space-y-4">
              <Input
                label="Dirección de Envío"
                name="direccion_envio"
                value={datosEnvio.direccion_envio}
                onChange={manejarCambioInput}
                placeholder="Calle, número, zona, y referencias"
                required
                icon={MapPin}
              />
              <Input
                label="Teléfono de Contacto"
                name="telefono_contacto"
                value={datosEnvio.telefono_contacto}
                onChange={manejarCambioInput}
                placeholder="El vendedor te contactará a este número"
                required
                icon={Phone}
              />
              <div>
                <label htmlFor="notas_cliente" className="block text-sm font-medium text-gray-700 mb-1">Notas para el Vendedor (Opcional)</label>
                <textarea
                  id="notas_cliente"
                  name="notas_cliente"
                  value={datosEnvio.notas_cliente}
                  onChange={manejarCambioInput}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: entregar en portería, llamar antes de llegar..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Columna de Resumen */}
        <div className="space-y-6">
          <Card variant="elevated" padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-800">{item.producto.nombre} x{item.cantidad}</span>
                  <span className="text-gray-600">Bs {(item.producto.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>Bs {total.toFixed(2)}</span>
            </div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="mt-6 bg-green-600 hover:bg-green-700"
              icon={procesando ? Loader : CreditCard}
              disabled={procesando}
            >
              {procesando ? 'Procesando Pedido...' : 'Realizar Pedido'}
            </Button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Al realizar el pedido, se creará un registro y serás redirigido para completar el pago.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}

export default FormularioCheckout;