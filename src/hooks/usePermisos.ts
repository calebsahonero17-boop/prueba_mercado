import { useMemo } from 'react';
import { UserRole, UserPermissions } from '../types/product';

// Definir permisos para cada rol
const permisosRol: Record<UserRole, UserPermissions> = {
  usuario: {
    canViewAdmin: false,
    canManageProducts: false,
    canManageUsers: false,
    canManageOrders: false,
    canManageCategories: false,
    canViewAnalytics: false,
    canDeleteProducts: false,
    canDeleteUsers: false,
    canViewSales: false,
  },
  vendedor: {
    canViewAdmin: false,
    canManageProducts: true,
    canManageUsers: false,
    canManageOrders: false, // No gestiona todos los pedidos, solo sus ventas
    canManageCategories: false,
    canViewAnalytics: false,
    canDeleteProducts: false,
    canDeleteUsers: false,
    canViewSales: true, // Permiso específico para ver su página de ventas
  },
  moderador: {
    canViewAdmin: true,
    canManageProducts: true,
    canManageUsers: false,
    canManageOrders: true,
    canManageCategories: true,
    canViewAnalytics: true,
    canDeleteProducts: false,
    canDeleteUsers: false,
    canViewSales: false,
  },
  admin: {
    canViewAdmin: true,
    canManageProducts: true,
    canManageUsers: true,
    canManageOrders: true,
    canManageCategories: true,
    canViewAnalytics: true,
    canDeleteProducts: true,
    canDeleteUsers: false,
    canViewSales: true, // Un admin también puede ver las ventas
  },
  super_admin: {
    canViewAdmin: true,
    canManageProducts: true,
    canManageUsers: true,
    canManageOrders: true,
    canManageCategories: true,
    canViewAnalytics: true,
    canDeleteProducts: true,
    canDeleteUsers: true,
    canViewSales: true,
  },
};

export function usePermisos(rolUsuario?: UserRole) {
  const permisos = useMemo(() => {
    if (!rolUsuario) {
      return permisosRol.usuario;
    }
    return permisosRol[rolUsuario] || permisosRol.usuario;
  }, [rolUsuario]);

  const tienePermiso = (permiso: keyof UserPermissions): boolean => {
    return permisos[permiso];
  };

  const tieneCualquierPermiso = (listaPermisos: (keyof UserPermissions)[]): boolean => {
    return listaPermisos.some(permiso => permisos[permiso]);
  };

  const tieneTodosLosPermisos = (listaPermisos: (keyof UserPermissions)[]): boolean => {
    return listaPermisos.every(permiso => permisos[permiso]);
  };

  return {
    permisos,
    tienePermiso,
    tieneCualquierPermiso,
    tieneTodosLosPermisos,
    esAdmin: tienePermiso('canViewAdmin'),
    esVendedor: tienePermiso('canViewSales'),
    puedeGestionarProductos: tienePermiso('canManageProducts'),
    puedeGestionarUsuarios: tienePermiso('canManageUsers'),
    puedeGestionarPedidos: tienePermiso('canManageOrders'),
    puedeEliminarProductos: tienePermiso('canDeleteProducts'),
    puedeEliminarUsuarios: tienePermiso('canDeleteUsers'),
  };
}

export { permisosRol };