import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Edit, X } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import VistaPerfilUsuario from '../components/VistaPerfilUsuario';
import { useToast } from '../contexts/ToastContext'; // Importar useToast

import ReviewsSection from '../components/ReviewsSection';
import { Button } from '../components/ui';
import { Card } from '../components/ui';
import { Spinner } from '../components/ui/Spinner';

function PerfilPagina() {
  const navigate = useNavigate();
  const { vendedorId } = useParams<{ vendedorId?: string }>();
  const { user: currentUser, loading: authLoading, refreshUser } = useSupabaseAuth();
  const toast = useToast(); // Obtener toast
  const [perfilIncompleto, setPerfilIncompleto] = useState(false);
  const [showSellerWarning, setShowSellerWarning] = useState(false); // Nuevo estado para controlar la visibilidad de la advertencia

  const esPropioPerfil = !vendedorId || (currentUser?.id === vendedorId);
  const userIdParaMostrar = esPropioPerfil ? currentUser?.id : vendedorId;

  const esVendedor = currentUser?.rol === 'vendedor';
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation(); // Hook para acceder al objeto location

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleDismissWarning = () => {
    setShowSellerWarning(false);
  };

  useEffect(() => {
    if (esPropioPerfil && esVendedor) {
      const perfilCompleto =
        currentUser?.telefono && currentUser.telefono.trim() !== '' &&
        currentUser?.descripcion && currentUser.descripcion.trim() !== '' &&
        currentUser?.ciudad && currentUser.ciudad.trim() !== '' && // Usamos ciudad como ubicacion_publica
        (currentUser?.qr_pago_1_url && currentUser.qr_pago_1_url.trim() !== ''); // Solo se necesita QR1 para el check

      setPerfilIncompleto(!perfilCompleto);
      setShowSellerWarning(!perfilCompleto); // Inicializar showSellerWarning
    }

    if (location.state && (location.state as any).startEditingSeller && esPropioPerfil && esVendedor) {
      setIsEditing(true);
      // Limpiar el estado de la localización para evitar que el modal se abra cada vez que se navegue
      navigate(location.pathname, { replace: true, state: {} }); 
    }
  }, [esPropioPerfil, esVendedor, location.state, setIsEditing, navigate, currentUser]); // Added currentUser to dependencies

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="w-full px-8 sm:px-12">
        <Card className="mb-8 p-8 bg-gradient-to-r from-blue-100 to-indigo-100 shadow-md rounded-lg">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {esPropioPerfil ? 'Mi Perfil' : 'Perfil del Vendedor'}
              </h1>
              <p className="text-gray-600 mt-1">
                {esPropioPerfil ? 'Gestiona tu información de cuenta y tus perfiles.' : 'Información y productos del vendedor.'}
              </p>
            </div>
          </div>
        </Card>

        {esPropioPerfil && perfilIncompleto && showSellerWarning && !isEditing && (
          <Card className="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1"> {/* Añadido flex-1 para que el botón se alinee a la derecha */}
                <h3 className="text-lg font-medium text-yellow-800">¡Completa tu Panel de Vendedor!</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Para poder publicar y vender productos, necesitas completar la siguiente información en tu <strong>Panel de Vendedor</strong>:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Una <strong>descripción</strong> para tu tienda.</li>
                    <li>Tu <strong>ubicación</strong> para que los clientes te encuentren.</li>
                    <li>Al menos un <strong>código QR</strong> de pago.</li>
                  </ul>
                  <p className="mt-2">Una vez que completes estos datos, podrás acceder a todas las funciones para vendedores.</p>
                  <Button onClick={() => { handleStartEditing(); handleDismissWarning(); }} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Completar mi perfil
                  </Button>
                </div>
              </div>
              <div className="ml-auto"> {/* Contenedor para el botón de cerrar */}
                <Button variant="ghost" size="icon" onClick={handleDismissWarning}>
                  <X className="h-5 w-5 text-yellow-400" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {authLoading ? (
          <Spinner message="Cargando perfil..." />
        ) : userIdParaMostrar ? (
          <>
            <div className="space-y-8">
              <div className="p-4 space-y-8">
                <VistaPerfilUsuario 
                  userId={userIdParaMostrar} 
                  esPropioPerfil={esPropioPerfil} 
                  esVendedor={esVendedor && esPropioPerfil}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  startIncomplete={perfilIncompleto}
                />
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 my-8"></div>
            <ReviewsSection 
              userId={userIdParaMostrar} 
              esPropioPerfil={esPropioPerfil}
              currentUser={currentUser} // Pasar el usuario actual
              toast={toast} // Pasar el toast
            />
          </>
        ) : (
          <Card className="text-center p-8">
            <h3 className="text-xl font-semibold">Usuario no encontrado</h3>
            <p className="text-gray-600 mt-2">Para ver este perfil, necesitas iniciar sesión.</p>
            <Button onClick={() => navigate('/login')} className="mt-4">Iniciar Sesión</Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PerfilPagina;
