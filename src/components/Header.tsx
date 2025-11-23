import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  UserPlus,
  Settings,
  Package,
  Store,
  Briefcase,
  MessageSquare
} from 'lucide-react';


import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';
import { usePermisos } from '../hooks/usePermisos';
import { useContextoMensajesNoLeidos } from '../contexts/ContextoMensajesNoLeidos';
import AvatarIniciales from './ui/AvatarIniciales';
import NotificationsBell from './ui/NotificationsBell';
import SearchBar from './ui/SearchBar';


function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useSupabaseAuth();
    const toast = useToast();
  const { esAdmin, esVendedor } = usePermisos(user?.rol);
  const { contadorNoLeidos } = useContextoMensajesNoLeidos(); // Hook para mensajes no leídos
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Has cerrado sesión exitosamente.');
    navigate('/iniciar-sesion');
  };
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenuButton = document.getElementById('user-menu-button');
      const userMenuDropdown = document.getElementById('user-menu-dropdown');

      if (isUserMenuOpen && userMenuButton && userMenuDropdown &&
          !userMenuButton.contains(event.target as Node) &&
          !userMenuDropdown.contains(event.target as Node))
      {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);



  console.log('isAuthenticated:', isAuthenticated, 'user:', user);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-[10000]">

      <div className="mx-auto">
        <div className="flex items-center py-3 px-4 sm:px-6">
        {/* Mobile menu button and Logo */}
        <div className="flex items-center">

          <Link to="/" className="ml-4 md:ml-0">
            <img src="/logito.png" alt="Logo" className="h-10 md:h-12" />
          </Link>
        </div>

                    <div className="flex-1 mx-2 md:mx-4">
                      <SearchBar
                        isAuthenticated={isAuthenticated}
                        esVendedor={esVendedor}
                        handleLogout={handleLogout}
                        user={user}
                      />
                    </div>
          
                    <div className="ml-auto flex items-center">
                      <div className="hidden md:flex items-center space-x-2 md:space-x-4"> {/* Adjusted space-x here */}
                        {isAuthenticated && user ? (
                          <>
                            {!esVendedor && (
                              <Button
                                className="bg-[#0041a8] text-white rounded-md shadow-md hover:bg-[#002a7a]"
                                size="sm"
                                icon={Store}
                                onClick={() => navigate('/suscripcion')}
                              >
                                Ser Vendedor
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => navigate('/mensajes')} className="relative rounded-full">
                              <MessageSquare className="h-5 w-5" />
                              {contadorNoLeidos > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                  {contadorNoLeidos}
                                </span>
                              )}
                            </Button>
          
                            {/* User Dropdown Trigger */}
                            <div className="relative">
                              <button
                                id="user-menu-button"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                {user.avatar ? (
                                  <img key={user.avatar} src={`${user.avatar}?t=${new Date().getTime()}`} alt="Mi Perfil" className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <AvatarIniciales nombres={user.nombres} apellidos={user.apellidos} className="w-10 h-10" />
                                )}
                              </button>
          
                              {/* User Dropdown Content */}
                              {isUserMenuOpen && (
                                <div
                                  id="user-menu-dropdown"
                                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                                >
                                  <button
                                    onClick={() => { navigate('/perfil'); setIsUserMenuOpen(false); }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <User className="inline-block w-4 h-4 mr-2" /> Mi Perfil
                                  </button>
                                  {esVendedor && (
                                    <button
                                      onClick={() => { navigate('/mis-productos'); setIsUserMenuOpen(false); }}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <Briefcase className="inline-block w-4 h-4 mr-2" /> Mis Productos
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { navigate('/mis-pedidos'); setIsUserMenuOpen(false); }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Package className="inline-block w-4 h-4 mr-2" /> Mis Pedidos
                                  </button>
                                  {esAdmin && (
                                    <button
                                      onClick={() => { navigate('/administracion'); setIsUserMenuOpen(false); }}
                                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    >
                                      <Settings className="inline-block w-4 h-4 mr-2" /> Admin
                                    </button>
                                  )}
                                  <button
                                    onClick={handleLogout}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <LogOut className="inline-block w-4 h-4 mr-2" /> Salir
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center space-x-6">
                            <Button variant="transparentOutline" className="rounded-md shadow-md px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base" size="md" icon={User} onClick={() => navigate('/iniciar-sesion')}>Iniciar Sesión</Button>
                            <Button variant="transparentOutline" className="rounded-md shadow-md px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base" size="md" icon={UserPlus} onClick={() => navigate('/registro')}>Registrarse</Button>
                          </div>
                        )}
                      </div>
                    </div>        </div>


      </div>
    </header>
  );
}

export default Header;