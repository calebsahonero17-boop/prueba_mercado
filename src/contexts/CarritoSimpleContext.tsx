import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product, ItemCarritoLocal, CrearPedidoData } from '../types/product';
import { useToast } from './ToastContext';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { usePedidos } from '../hooks/usePedidos';

// Estado del carrito simplificado
interface EstadoCarritoSimple {
  items: ItemCarritoLocal[];
  total: number;
  cantidadTotal: number;
  abierto: boolean;
}

// Acciones del carrito
type AccionCarrito =
  | { type: 'AGREGAR_ITEM'; payload: { producto: Product; cantidad: number } }
  | { type: 'ELIMINAR_ITEM'; payload: { productoId: string } }
  | { type: 'ACTUALIZAR_CANTIDAD'; payload: { productoId: string; cantidad: number } }
  | { type: 'LIMPIAR_CARRITO' }
  | { type: 'ALTERNAR_CARRITO' }
  | { type: 'CERRAR_CARRITO' };

// Estado inicial
const estadoInicial: EstadoCarritoSimple = {
  items: [],
  total: 0,
  cantidadTotal: 0,
  abierto: false,
};

// Reducer del carrito
function carritoReducer(estado: EstadoCarritoSimple, accion: AccionCarrito): EstadoCarritoSimple {
  switch (accion.type) {
    case 'AGREGAR_ITEM': {
      const { producto, cantidad } = accion.payload;
      const itemExistente = estado.items.find(item => item.producto.id === producto.id);

      let nuevosItems: ItemCarritoLocal[];
      if (itemExistente) {
        nuevosItems = estado.items.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        const nuevoItem: ItemCarritoLocal = {
          id: `item_${Date.now()}_${producto.id}`,
          producto,
          cantidad,
          fechaAgregado: new Date(),
        };
        nuevosItems = [...estado.items, nuevoItem];
      }

      const total = nuevosItems.reduce((suma, item) => suma + (item.producto.precio * item.cantidad), 0);
      const cantidadTotal = nuevosItems.reduce((cuenta, item) => cuenta + item.cantidad, 0);

      return {
        ...estado,
        items: nuevosItems,
        total,
        cantidadTotal,
      };
    }

    case 'ELIMINAR_ITEM': {
      const nuevosItems = estado.items.filter(item => item.producto.id !== accion.payload.productoId);
      const total = nuevosItems.reduce((suma, item) => suma + (item.producto.precio * item.cantidad), 0);
      const cantidadTotal = nuevosItems.reduce((cuenta, item) => cuenta + item.cantidad, 0);

      return {
        ...estado,
        items: nuevosItems,
        total,
        cantidadTotal,
      };
    }

    case 'ACTUALIZAR_CANTIDAD': {
      const { productoId, cantidad } = accion.payload;

      if (cantidad <= 0) {
        // Si la cantidad es 0 o negativa, eliminar el item
        return carritoReducer(estado, { type: 'ELIMINAR_ITEM', payload: { productoId } });
      }

      const nuevosItems = estado.items.map(item =>
        item.producto.id === productoId
          ? { ...item, cantidad }
          : item
      );

      const total = nuevosItems.reduce((suma, item) => suma + (item.producto.precio * item.cantidad), 0);
      const cantidadTotal = nuevosItems.reduce((cuenta, item) => cuenta + item.cantidad, 0);

      return {
        ...estado,
        items: nuevosItems,
        total,
        cantidadTotal,
      };
    }

    case 'LIMPIAR_CARRITO':
      return {
        ...estado,
        items: [],
        total: 0,
        cantidadTotal: 0,
      };

    case 'ALTERNAR_CARRITO':
      return {
        ...estado,
        abierto: !estado.abierto,
      };

    case 'CERRAR_CARRITO':
      return {
        ...estado,
        abierto: false,
      };

    default:
      return estado;
  }
}

// Acciones del contexto
interface AccionesCarrito {
  agregarItem: (producto: Product, cantidad?: number) => void;
  eliminarItem: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  alternarCarrito: () => void;
  cerrarCarrito: () => void;
  crearPedidoDesdeCarrito: (datosEnvio: Omit<CrearPedidoData, 'items'>) => Promise<boolean>;
}

// Contexto
const CarritoContext = createContext<(EstadoCarritoSimple & AccionesCarrito) | null>(null);

// Provider
interface CarritoProviderProps {
  children: ReactNode;
}

export function CarritoSimpleProvider({ children }: CarritoProviderProps) {
  const [estado, dispatch] = useReducer(carritoReducer, estadoInicial);
  const toast = useToast();
  const { user, isAuthenticated } = useSupabaseAuth();
  const { crearPedido } = usePedidos();

  const acciones: AccionesCarrito = {
    agregarItem: (producto: Product, cantidad: number = 1) => {
      if (cantidad <= 0) {
        toast.error('La cantidad debe ser mayor a 0');
        return;
      }

      const itemExistente = estado.items.find(item => item.producto.id === producto.id);
      const cantidadPrevia = itemExistente ? itemExistente.cantidad : 0;

      if ((cantidadPrevia + cantidad) > producto.stock) {
        toast.error(`Stock insuficiente. Solo quedan ${producto.stock} unidades disponibles.`);
        return;
      }

      dispatch({
        type: 'AGREGAR_ITEM',
        payload: { producto, cantidad }
      });

      toast.success(`${producto.nombre} agregado al carrito`);
    },

    eliminarItem: (productoId: string) => {
      const item = estado.items.find(item => item.producto.id === productoId);
      if (item) {
        dispatch({
          type: 'ELIMINAR_ITEM',
          payload: { productoId }
        });
        toast.info(`${item.producto.nombre} eliminado del carrito`);
      }
    },

    actualizarCantidad: (productoId: string, cantidad: number) => {
      if (cantidad < 0) {
        toast.error('La cantidad no puede ser negativa');
        return;
      }

      const item = estado.items.find(item => item.producto.id === productoId);
      if (item && item.producto.stock < cantidad) {
        toast.error(`Solo hay ${item.producto.stock} unidades disponibles`);
        return;
      }

      dispatch({
        type: 'ACTUALIZAR_CANTIDAD',
        payload: { productoId, cantidad }
      });

      if (cantidad === 0) {
        toast.info(`${item?.producto.nombre} eliminado del carrito`);
      }
    },

    limpiarCarrito: () => {
      dispatch({ type: 'LIMPIAR_CARRITO' });
      toast.info('Carrito vaciado');
    },

    alternarCarrito: () => {
      dispatch({ type: 'ALTERNAR_CARRITO' });
    },

    cerrarCarrito: () => {
      dispatch({ type: 'CERRAR_CARRITO' });
    },

    crearPedidoDesdeCarrito: async (datosEnvio: Omit<CrearPedidoData, 'items'>): Promise<any | null> => {
      console.log('🛒 Iniciando crearPedidoDesdeCarrito con datos:', datosEnvio);

      if (!isAuthenticated || !user) {
        toast.error('Debes iniciar sesión para realizar un pedido');
        return null;
      }

      if (estado.items.length === 0) {
        toast.error('El carrito está vacío');
        return null;
      }

      // Agrupar items por vendedor
      const itemsPorVendedor = estado.items.reduce((acc, item) => {
        const vendedorId = item.producto.vendedor_id;
        if (vendedorId) {
          if (!acc[vendedorId]) {
            acc[vendedorId] = [];
          }
          acc[vendedorId].push(item);
        }
        return acc;
      }, {} as Record<string, ItemCarritoLocal[]>);

      const vendedoresIds = Object.keys(itemsPorVendedor);

      if (vendedoresIds.length === 0) {
        toast.error('Ningún producto en el carrito tiene un vendedor asignado.');
        return null;
      }

      if (vendedoresIds.length > 1) {
        toast.error('Actualmente solo puedes comprar de un vendedor a la vez. Por favor, finaliza tu compra para cada vendedor por separado.');
        return null;
      }

      const vendedorId = vendedoresIds[0];
      const itemsDelVendedor = itemsPorVendedor[vendedorId];

      try {
        console.log('🛒 Procesando carrito con', itemsDelVendedor.length, 'items para el vendedor:', vendedorId);

        const itemsPedido = itemsDelVendedor.map(item => ({
          producto_id: item.producto.id,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio
        }));

        const datosPedido: CrearPedidoData = {
          ...datosEnvio,
          items: itemsPedido
        };
        
        const pedidoCreado = await crearPedido(datosPedido, user.id, vendedorId, 'pendiente');

        if (pedidoCreado) {
          console.log('✅ Pedido creado exitosamente:', pedidoCreado.numero_pedido);
          dispatch({ type: 'LIMPIAR_CARRITO' });
          dispatch({ type: 'CERRAR_CARRITO' });
          return pedidoCreado;
        } else {
          console.log('❌ No se pudo crear el pedido (retorno null/false de crearPedido)');
          // El error ya se muestra en usePedidos, no es necesario otro toast aquí.
          return null;
        }

      } catch (error: any) {
        console.error('❌ Error crítico creando pedido desde carrito:', error);
        toast.error(error.message || 'Error desconocido al procesar el pedido.');
        return null;
      }
    },
  };

  return (
    <CarritoContext.Provider value={{ ...estado, ...acciones }}>
      {children}
    </CarritoContext.Provider>
  );
}

// Hook para usar el carrito
export function useCarritoSimple() {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarritoSimple debe usarse dentro de un CarritoSimpleProvider');
  }
  return context;
}