import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product, CartItem, CartState, CartActions } from '../types/product';
import { useToast } from './ToastContext';

// Cart Actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' };

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product.id === product.id);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: Date.now(),
          product,
          quantity,
          addedAt: new Date(),
        };
        newItems = [...state.items, newItem];
      }

      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.product.id !== action.payload.productId);
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }

      const newItems = state.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );

      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total,
        itemCount,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
}

// Context
const CartContext = createContext<(CartState & CartActions) | null>(null);

// Provider component with toast integration
interface CartProviderProps {
  children: ReactNode;
}

function CartProviderInner({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const toast = useToast();

  const actions: CartActions = {
    addItem: (product: Product, quantity = 1) => {
      const existingItem = state.items.find(item => item.product.id === product.id);

      dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });

      if (existingItem) {
        toast.success(
          `Cantidad actualizada: ${existingItem.quantity + quantity}`,
          `${product.title}`
        );
      } else {
        toast.success(
          `${product.title} agregado al carrito`,
          quantity > 1 ? `Cantidad: ${quantity}` : undefined
        );
      }
    },

    removeItem: (productId: number) => {
      const item = state.items.find(item => item.product.id === productId);

      dispatch({ type: 'REMOVE_ITEM', payload: { productId } });

      if (item) {
        toast.info(
          `${item.product.title} eliminado del carrito`,
          'Producto removido'
        );
      }
    },

    updateQuantity: (productId: number, quantity: number) => {
      const item = state.items.find(item => item.product.id === productId);

      if (quantity <= 0) {
        actions.removeItem(productId);
        return;
      }

      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });

      if (item) {
        toast.info(
          `Cantidad actualizada: ${quantity}`,
          `${item.product.title}`
        );
      }
    },

    clearCart: () => {
      const itemCount = state.itemCount;

      dispatch({ type: 'CLEAR_CART' });

      if (itemCount > 0) {
        toast.warning(
          `${itemCount} producto${itemCount > 1 ? 's' : ''} eliminado${itemCount > 1 ? 's' : ''}`,
          'Carrito vaciado'
        );
      }
    },

    toggleCart: () => {
      dispatch({ type: 'TOGGLE_CART' });
    },

    closeCart: () => {
      dispatch({ type: 'CLOSE_CART' });
    },
  };

  return (
    <CartContext.Provider value={{ ...state, ...actions }}>
      {children}
    </CartContext.Provider>
  );
}

// Main provider that ensures ToastContext is available
export function CartProvider({ children }: CartProviderProps) {
  return (
    <CartProviderInner>
      {children}
    </CartProviderInner>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}