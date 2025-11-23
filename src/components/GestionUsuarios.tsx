import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, ShieldCheck, ShieldX, Edit3, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Card, Input } from './ui';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermisos } from '../hooks/usePermisos';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types/product';

interface GestionUsuariosProps {
  actualizacionTrigger?: number;
}

function GestionUsuarios({ actualizacionTrigger }: GestionUsuariosProps) {
  const toast = useToast();
  const { user: usuarioActual } = useSupabaseAuth();
  const { puedeGestionarUsuarios, puedeEliminarUsuarios } = usePermisos(usuarioActual?.rol);

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [cargando, setCargando] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [editandoUsuario, setEditandoUsuario] = useState<User | null>(null);
  const [procesando, setProcesando] = useState(false);

  const rolesDisponibles: UserRole[] = ['usuario', 'vendedor', 'moderador', 'admin', 'super_admin'];

  const obtenerNombreRol = (rol?: UserRole) => {
    const nombres = {
      usuario: 'Usuario',
      vendedor: 'Vendedor',
      moderador: 'Moderador',
      admin: 'Administrador',
      super_admin: 'Super Admin'
    };
    return nombres[rol || 'usuario'];
  };

  const obtenerColorRol = (rol?: UserRole) => {
    const colores = {
      usuario: 'bg-gray-100 text-gray-800',
      vendedor: 'bg-orange-100 text-orange-800',
      moderador: 'bg-blue-100 text-blue-800',
      admin: 'bg-green-100 text-green-800',
      super_admin: 'bg-purple-100 text-purple-800'
    };
    return colores[rol || 'usuario'];
  };

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error cargando usuarios:', error);
        toast.error('Error al cargar usuarios');
        return;
      }

      setUsuarios(data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (puedeGestionarUsuarios) {
      cargarUsuarios();
    }
  }, [puedeGestionarUsuarios, actualizacionTrigger]);

  const usuariosFiltrados = usuarios.filter(usuario =>
    `${usuario.nombres} ${usuario.apellidos}`.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    usuario.carnet_identidad?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    obtenerNombreRol(usuario.rol).toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  const cambiarRolUsuario = async (usuarioId: string, nuevoRol: UserRole) => {
    if (!puedeGestionarUsuarios) {
      toast.error('No tienes permisos para cambiar roles');
      return;
    }

    // Prevenir que un admin se quite su propio rol super_admin
    if (usuarioId === usuarioActual?.id && usuarioActual?.rol === 'super_admin' && nuevoRol !== 'super_admin') {
      toast.error('No puedes cambiar tu propio rol de Super Admin');
      return;
    }

    setProcesando(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          rol: nuevoRol,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', usuarioId);

      if (error) throw error;

      toast.success('Rol actualizado exitosamente');
      await cargarUsuarios();
      setEditandoUsuario(null);
    } catch (error) {
      console.error('Error actualizando rol:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setProcesando(false);
    }
  };

  const alternarEstadoUsuario = async (usuarioId: string, estadoActual?: boolean) => {
    if (!puedeGestionarUsuarios) {
      toast.error('No tienes permisos para cambiar el estado de usuarios');
      return;
    }

    // Prevenir que un admin se desactive a sí mismo
    if (usuarioId === usuarioActual?.id) {
      toast.error('No puedes cambiar tu propio estado');
      return;
    }

    const nuevoEstado = !estadoActual;
    setProcesando(true);

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          activo: nuevoEstado,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', usuarioId);

      if (error) throw error;

      toast.success(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      await cargarUsuarios();
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      toast.error('Error al cambiar el estado del usuario');
    } finally {
      setProcesando(false);
    }
  };

  if (!puedeGestionarUsuarios) {
    return (
      <Card variant="elevated" padding="lg" className="text-center">
        <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h3>
        <p className="text-gray-600">No tienes permisos para gestionar usuarios.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-gray-600">Administra roles y estados de usuarios</p>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <Card variant="elevated" padding="md">
        <Input
          type="text"
          placeholder="Buscar usuarios por nombre, CI o rol..."
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          icon={Search}
        />
      </Card>

      {/* Lista de usuarios */}
      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Usuarios ({usuariosFiltrados.length})
          </h3>
        </div>

        {cargando ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-4">
                          {usuario.avatar || `${usuario.nombres.charAt(0)}${usuario.apellidos.charAt(0)}`}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombres} {usuario.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">CI: {usuario.carnet_identidad}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editandoUsuario?.id === usuario.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editandoUsuario.rol || 'usuario'}
                            onChange={(e) => setEditandoUsuario({
                              ...editandoUsuario,
                              rol: e.target.value as UserRole
                            })}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            disabled={procesando}
                          >
                            {rolesDisponibles.map(rol => (
                              <option key={rol} value={rol}>
                                {obtenerNombreRol(rol)}
                              </option>
                            ))}
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cambiarRolUsuario(usuario.id, editandoUsuario.rol || 'usuario')}
                            disabled={procesando}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditandoUsuario(null)}
                            disabled={procesando}
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${obtenerColorRol(usuario.rol)}`}>
                            {obtenerNombreRol(usuario.rol)}
                          </span>
                          {puedeGestionarUsuarios && usuario.id !== usuarioActual?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditandoUsuario(usuario)}
                              disabled={procesando}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          usuario.activo !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                        {puedeGestionarUsuarios && usuario.id !== usuarioActual?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => alternarEstadoUsuario(usuario.id, usuario.activo)}
                            disabled={procesando}
                          >
                            {usuario.activo !== false ?
                              <Ban className="w-3 h-3 text-red-600" /> :
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            }
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(usuario.fecha_creacion).toLocaleDateString('es-BO')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {puedeGestionarUsuarios && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditandoUsuario(usuario)}
                            disabled={procesando || usuario.id === usuarioActual?.id}
                          >
                            <Shield className="w-4 h-4 text-blue-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default GestionUsuarios;