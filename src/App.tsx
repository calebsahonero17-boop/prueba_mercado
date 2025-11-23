import React, { useState } from 'react';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { FavoritosProvider } from './contexts/FavoritosContext';
import TopBar from './components/TopBar';
import Header from './components/Header';
import { ToastContainer } from './components/ui';
import SuscripcionPage from './pages/SuscripcionPage';

// El contenido principal de la aplicación, ahora dentro del contexto de autenticación
function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [navigationParams, setNavigationParams] = useState<Record<string, any>>({});
  const { user } = useSupabaseAuth(); // Ahora podemos acceder al usuario aquí

  const handleNavigation = (page: string, params?: Record<string, any>) => {
    setCurrentPage(page);
    setNavigationParams(params || {});
    window.scrollTo(0, 0); // Volver al inicio de la página en cada navegación
  };

  const renderPage = () => {
    // Verificamos si la suscripción del vendedor está activa
    const esVendedorActivo = user?.rol === 'vendedor' && 
                             user.fecha_expiracion_suscripcion && 
                             new Date(user.fecha_expiracion_suscripcion) > new Date();

    switch (currentPage) {
      case 'buy':
        return <BuyPage onNavigate={handleNavigation} />;
      case 'sell':
        // Ruta protegida: solo vendedores activos pueden ver la página de vender
        return esVendedorActivo ? <SellPage onNavigate={handleNavigation} /> : <SuscripcionPage onNavigate={handleNavigation} />;
      case 'suscripcion':
        // Nueva ruta para la página de suscripción
        return <SuscripcionPage onNavigate={handleNavigation} />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigation} />;
      case 'faq':
        return <FAQPage onNavigate={handleNavigation} />;
      case 'blog':
        return <BlogPage onNavigate={handleNavigation} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigation} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigation} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigation} vendedorId={navigationParams.vendedorId} />;
      case 'admin':
        return <AdminPage onNavigate={handleNavigation} />;
      case 'mis-pedidos':
        return <MisPedidosPage onNavigate={handleNavigation} />;
      case 'home':
      default:
        return (
          <div className="min-h-screen bg-gray-50">
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Header currentPage={currentPage} onNavigate={handleNavigation} />
      {renderPage()}
      <ToastContainer />
    </div>
  );
}

// El componente App ahora solo se encarga de proveer los contextos
function App() {
  return (
    <SupabaseAuthProvider>
      <ToastProvider>
        <FavoritosProvider>
          <AppContent />
        </FavoritosProvider>
      </ToastProvider>
    </SupabaseAuthProvider>
  );
}

export default App;