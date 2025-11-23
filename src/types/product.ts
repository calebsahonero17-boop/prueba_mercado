export interface Product {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  url_imagen?: string;
  imagenes_adicionales?: string[]; // Array de URLs de imágenes adicionales
  categoria: string; // Ahora es el ID (UUID) de la categoría
  categoria_nombre?: string; // Para mostrar el nombre de la categoría
  condicion?: string; // 'nuevo', 'usado', 'reacondicionado'
  stock: number;
  activo?: boolean;
  destacado?: boolean;
  vendedor_id?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  estado?: string;
}

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  parent_id: string | null;
}

export interface CartItem {
  id: string;
  usuario_id: string;
  producto_id: string;
  cantidad: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  producto?: Product;
}

// Tipo simplificado para carrito local
export interface ItemCarritoLocal {
  id: string;
  producto: Product;
  cantidad: number;
  fechaAgregado: Date;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
}

export interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  crearPedidoDesdeCarrito: (datosEnvio: CrearPedidoData) => Promise<boolean>;
}

// User roles
export type UserRole = 'usuario' | 'vendedor' | 'moderador' | 'admin' | 'super_admin';

export interface UserPermissions {
  canViewAdmin: boolean;
  canManageProducts: boolean;
  canManageUsers: boolean;
  canManageOrders: boolean;
  canManageCategories: boolean;
  canViewAnalytics: boolean;
  canDeleteProducts: boolean;
  canDeleteUsers: boolean;
  canViewSales: boolean; // Permiso para ver la página de 'Mis Ventas'
}

// User types
export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  carnet_identidad?: string;
  ciudad?: string;
  avatar?: string;
  rol?: UserRole;
  activo?: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAllSessions: () => Promise<void>;
  emergencyReset: () => void;
  testSupabaseConnection: () => Promise<boolean>;
  enableDemoMode: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  forceStopLoading: () => void;
  refreshUser: () => Promise<void>;
}

export interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  carnet_identidad: string;
  ciudad: string;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

export interface ToastState {
  toasts: Toast[];
}

export interface ToastActions {
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
}

// Tipos para pedidos
export type EstadoPedido = 'pendiente' | 'pendiente_confirmacion' | 'confirmado' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';

export interface Pedido {
  id: string;
  usuario_id: string;
  numero_pedido: string;
  estado: EstadoPedido;
  total: number;
  subtotal: number;
  direccion_envio?: string;
  telefono_contacto?: string;
  notas_cliente?: string;
  notas_admin?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_envio?: string;
  fecha_entrega?: string;
  // Relaciones
  usuario?: User;
  detalles?: DetallePedido[];
}

export interface DetallePedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  fecha_creacion: string;
  // Relaciones
  producto?: Product;
}

export interface CrearPedidoData {
  direccion_envio: string;
  telefono_contacto: string;
  notas_cliente?: string;
  items: {
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface EstadisticasPedidos {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosCompletados: number;
  ventasTotales: number;
  ventasHoy: number;
  ventasSemana: number;
  ventasMes: number;
  productoMasVendido?: {
    producto: Product;
    cantidad: number;
  };
  estadosPedidos: {
    [key in EstadoPedido]: number;
  };
}