import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { FavoritosProvider } from './contexts/FavoritosContext';
import { ProveedorMensajesNoLeidos } from "./contexts/ContextoMensajesNoLeidos";
import TopBar from "./components/TopBar";
import Header from './components/Header';
import Footer from './components/Footer';
import ThreeDCarousel from './components/ThreeDCarousel';
import PromoBanner from './components/PromoBanner';
import ToastContainer from './components/ui/ToastContainer';
import Button from './components/ui/Button';
import { Spinner } from './components/ui/Spinner';
import { MessageCircle } from 'lucide-react'; // New import for icon
import ChatSystem from './components/ChatSystem'; // New import for ChatSystem

// --- Páginas (importadas dinámicamente) ---
const ComprarPagina = React.lazy(() => import('./pages/ComprarPagina'));
const VenderPagina = React.lazy(() => import('./pages/VenderPagina'));
const ContactoPagina = React.lazy(() => import('./pages/ContactoPagina'));
const PreguntasFrecuentesPagina = React.lazy(() => import('./pages/PreguntasFrecuentesPagina'));
const RegistroPagina = React.lazy(() => import('./pages/RegistroPagina'));
const InicioSesionPagina = React.lazy(() => import('./pages/InicioSesionPagina'));
const PerfilPagina = React.lazy(() => import('./pages/PerfilPagina'));
const AdministracionPagina = React.lazy(() => import('./pages/AdministracionPagina'));
const MisPedidosPage = React.lazy(() => import('./pages/MisPedidosPage'));
const SuscripcionPage = React.lazy(() => import('./pages/SuscripcionPage'));
const MisProductosPage = React.lazy(() => import('./pages/MisProductosPage'));
const ProductoPagina = React.lazy(() => import('./pages/ProductoPagina'));
const MensajesPage = React.lazy(() => import('./pages/MensajesPage'));
const QuienesSomosPagina = React.lazy(() => import('./pages/QuienesSomosPagina'));
const OlvidoContrasenaPagina = React.lazy(() => import('./pages/OlvidoContrasenaPagina'));

import CategoryCarousel from './components/CategoryCarousel';
import CategoryProductRow from './components/CategoryProductRow';
import PromoBanner2 from './components/PromoBanner2'; // Import the new banner
import { useCategories } from './hooks/useProducts';

const HomePage = () => {
  const navigate = useNavigate();
  const { categories, loading: loadingCategories } = useCategories();

  const parentCategories = React.useMemo(() => {
    if (loadingCategories || !categories) return [];
    return categories.filter(cat => cat.parent_id === null);
  }, [categories, loadingCategories]);

  return (
    <div className="bg-gray-50">
      <PromoBanner />
      <ThreeDCarousel />
      <CategoryCarousel />
      <div className="w-full my-0"> {/* Contenedor para el video */}
        <div className="aspect-w-16 aspect-h-9"> {/* Contenedor de relación de aspecto 16:9 */}
          <video autoPlay muted loop className="w-full h-full object-contain">
            <source src="/videos/ENUNCIANTE_HORIZONTAL.mp4" type="video/mp4" />
            Tu navegador no soporta la etiqueta de video.
          </video>
        </div>
      </div>
      {loadingCategories ? (
        <div className="h-64 flex justify-center items-center"><Spinner /></div>
      ) : (
        parentCategories.map(category => (
          <React.Fragment key={category.id}>
            <CategoryProductRow categoryName={category.nombre} allCategories={categories} />
            {category.nombre === 'Deportes y actividades al aire libre' && (
              <PromoBanner2 text="Mercado Express: la forma más fácil de comprar lo que quieres, cuando quieres." />
            )}
            {category.nombre === 'Hogar y jardín' && (
              <PromoBanner2 text="Mercado Express incorpora Código QR en todos los perfiles de vendedores." />
            )}
          </React.Fragment>
        ))
      )}
      <Footer />
    </div>
  );
};

const VendedorProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useSupabaseAuth();
  console.log('VendedorProtectedRoute: user', user); // <-- Modificado aquí
  console.log('VendedorProtectedRoute: loading', loading);
  if (loading) {
    return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
  }

  // Si el usuario tiene el rol de 'vendedor', permitir el acceso.
  // La lógica de suscripción y perfil incompleto se manejará dentro de las páginas de vendedor.
  if (user?.rol === 'vendedor' || user?.rol === 'admin' || user?.rol === 'super_admin') {
    return children;
  }

  // Si el usuario tiene el rol de 'usuario', redirigir a la página de suscripción
  // para que pueda elegir un plan de vendedor.
  if (user?.rol === 'usuario' || user?.rol === 'comprador') {
    return <Navigate to="/suscripcion" replace />;
  }

  // Si no está logueado o tiene otro rol, redirigir a la página de login.
  // Alternativamente, se podría redirigir a /suscripcion si se quiere que todos los no-vendedores
  // que intenten acceder a rutas de vendedor pasen por la suscripción.
  return <Navigate to="/iniciar-sesion" replace />;
};

const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return <div className="h-screen flex justify-center items-center"><Spinner /></div>;
  }

  if (user?.rol !== 'admin' && user?.rol !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

import { useChatContext } from './contexts/ChatContext'; // Importar el hook del contexto

function AppContent() {
  const navigate = useNavigate();
  // Usar el contexto del chat para controlar el estado del modal
  const { isChatOpen, openChat, closeChat } = useChatContext();

  return (
    <div className="bg-gray-50">
      <TopBar />
      <Header />
      
      <main>
        <React.Suspense fallback={<div className="h-screen flex justify-center items-center"><Spinner /></div>}>
          <Routes>
            {/* --- Rutas Públicas --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/comprar" element={<ComprarPagina />} />
            <Route path="/producto/:productoId" element={<ProductoPagina />} />
            <Route path="/contacto" element={<ContactoPagina />} />
            <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPagina />} />
            <Route path="/quienes-somos" element={<QuienesSomosPagina />} />
            <Route path="/registro" element={<RegistroPagina />} />
            <Route path="/iniciar-sesion" element={<InicioSesionPagina />} />
            <Route path="/olvido-contrasena" element={<OlvidoContrasenaPagina />} />
            <Route path="/suscripcion" element={<SuscripcionPage />} />
            {/* --- Rutas Protegidas --- */}
            <Route path="/perfil/" element={<PerfilPagina />} />
            <Route path="/perfil/:vendedorId" element={<PerfilPagina />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
            <Route path="/mensajes" element={<MensajesPage />} />

            {/* --- Ruta Protegida para Vendedores --- */}
            <Route 
              path="/vender" 
              element={
                <VendedorProtectedRoute>
                  <VenderPagina />
                </VendedorProtectedRoute>
              }
            />
            <Route 
              path="/vender/:productId" 
              element={
                <VendedorProtectedRoute>
                  <VenderPagina />
                </VendedorProtectedRoute>
              }
            />
            <Route 
              path="/mis-productos" 
              element={
                <VendedorProtectedRoute>
                  <MisProductosPage />
                </VendedorProtectedRoute>
              }
            />

            {/* --- Ruta Protegida para Administradores --- */}
            <Route 
              path="/administracion" 
              element={
                <AdminProtectedRoute>
                  <AdministracionPagina />
                </AdminProtectedRoute>
              }
            />

            {/* --- Redirección para rutas no encontradas --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </main>
      
      <ToastContainer position="top-center" />

      {/* --- Botón Flotante de Chat --- */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-50"
        onClick={() => openChat()} // Usar la función del contexto
      >
        <MessageCircle className="w-7 h-7" />
      </Button>

      {/* --- Sistema de Chat (Modal) --- */}
      {/* El componente ChatSystem ahora es controlado por el contexto */}
      <ChatSystem />
    </div>
  );
}

import { ChatProvider } from './contexts/ChatContext'; // Importar el nuevo ChatProvider

function AppConRouter() {
  return (
    <BrowserRouter>
      <SupabaseAuthProvider>
        <ToastProvider>
          <FavoritosProvider>
            <ProveedorMensajesNoLeidos>
              <ChatProvider> {/* Envolver con ChatProvider */}
                <AppContent />
              </ChatProvider>
            </ProveedorMensajesNoLeidos>
          </FavoritosProvider>
        </ToastProvider>
      </SupabaseAuthProvider>
    </BrowserRouter>
  );
}

export default AppConRouter;