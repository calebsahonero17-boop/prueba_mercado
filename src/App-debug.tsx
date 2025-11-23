import React, { useState } from 'react';
import { FallbackAuthProvider } from './contexts/FallbackAuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <FallbackAuthProvider>
      <CartProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <Header currentPage={currentPage} onNavigate={setCurrentPage} />
            <div className="p-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-4">¡Mercado Express - Debug Nivel 3!</h1>
              <p className="text-gray-700">La aplicación con Header está funcionando.</p>
              <div className="mt-8 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Estado de la aplicación:</h2>
                <ul className="space-y-2">
                  <li className="text-green-600">✅ React está funcionando</li>
                  <li className="text-green-600">✅ Tailwind CSS está cargado</li>
                  <li className="text-green-600">✅ FallbackAuthProvider cargado</li>
                  <li className="text-green-600">✅ CartProvider cargado</li>
                  <li className="text-green-600">✅ ToastProvider cargado</li>
                  <li className="text-green-600">✅ Header cargado</li>
                  <li className="text-blue-600">📄 Página actual: {currentPage}</li>
                </ul>
                <button
                  onClick={() => setCurrentPage(currentPage === 'home' ? 'test' : 'home')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Cambiar página
                </button>
              </div>
            </div>
          </div>
        </ToastProvider>
      </CartProvider>
    </FallbackAuthProvider>
  );
}

export default App;