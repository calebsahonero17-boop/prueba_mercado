import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useCarritoSimple } from '../../contexts/CarritoSimpleContext';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import Button from './Button';

interface CartDrawerSimpleProps {
  onNavigateToCheckout?: () => void;
}

export default function CartDrawerSimple({ onNavigateToCheckout }: CartDrawerSimpleProps) {
  const {
    items,
    total,
    cantidadTotal,
    abierto,
    cerrarCarrito,
    eliminarItem,
    actualizarCantidad,
    limpiarCarrito
  } = useCarritoSimple();

  const { isAuthenticated } = useSupabaseAuth();

  const manejarActualizarCantidad = (productoId: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 0) return;
    actualizarCantidad(productoId, nuevaCantidad);
  };

  const manejarCheckout = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para continuar con la compra');
      return;
    }

    if (onNavigateToCheckout) {
      onNavigateToCheckout();
      cerrarCarrito();
    }
  };

  if (!abierto) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={cerrarCarrito}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Carrito ({cantidadTotal})
              </h2>
            </div>
            <button
              onClick={cerrarCarrito}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500 text-center">
                  Agrega algunos productos para comenzar tu compra
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.producto.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80'}
                      alt={item.producto.nombre}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80';
                      }}
                    />

                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.producto.nombre}
                      </h4>
                      <p className="text-blue-600 font-semibold">
                        Bs {item.producto.precio}
                      </p>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => manejarActualizarCantidad(item.producto.id, item.cantidad - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          disabled={item.cantidad <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                          {item.cantidad}
                        </span>

                        <button
                          onClick={() => manejarActualizarCantidad(item.producto.id, item.cantidad + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                          disabled={item.cantidad >= item.producto.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => eliminarItem(item.producto.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        Bs {(item.producto.precio * item.cantidad).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between text-xl font-bold">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">Bs {total.toFixed(2)}</span>
              </div>

              {/* Botones */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  icon={CreditCard}
                  onClick={manejarCheckout}
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? 'Finalizar Compra' : 'Inicia Sesión para Comprar'}
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  onClick={limpiarCarrito}
                >
                  Vaciar Carrito
                </Button>
              </div>

              {!isAuthenticated && (
                <p className="text-xs text-gray-500 text-center">
                  Debes iniciar sesión para continuar con la compra
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}