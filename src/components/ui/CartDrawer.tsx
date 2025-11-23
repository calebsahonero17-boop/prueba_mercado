import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';

export default function CartDrawer() {
  const { items, total, itemCount, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();
  const toast = useToast();

  const handleRemoveItem = (productId: number) => {
    const item = items.find(item => item.product.id === productId);
    removeItem(productId);

    if (item) {
      toast.info(
        `${item.product.title} eliminado del carrito`,
        'Producto removido'
      );
    }
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    const item = items.find(item => item.product.id === productId);

    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    updateQuantity(productId, quantity);

    if (item) {
      toast.info(
        `Cantidad actualizada: ${quantity}`,
        `${item.product.title}`
      );
    }
  };

  const handleClearCart = () => {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    clearCart();

    if (itemCount > 0) {
      toast.warning(
        `${itemCount} producto${itemCount > 1 ? 's' : ''} eliminado${itemCount > 1 ? 's' : ''}`,
        'Carrito vaciado'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Mi Carrito ({itemCount})
              </h2>
              <button
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                onClick={closeCart}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                <p className="text-gray-500 mb-6">Agrega productos para comenzar a comprar</p>
                <button
                  onClick={closeCart}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl border">
                        {item.product.image}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{item.product.location}</p>
                        <p className="text-lg font-bold text-green-600 mb-3">
                          Bs {item.product.price.toLocaleString()}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Cantidad:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                className="p-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-1 text-center min-w-[2.5rem] text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            Subtotal: Bs {(item.product.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  Bs {total.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors">
                  Proceder al Pago
                </button>

                <button
                  onClick={handleClearCart}
                  className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar Carrito
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}