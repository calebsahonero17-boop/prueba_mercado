import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">¡Mercado Express!</h1>
      <p className="text-gray-700">La aplicación está funcionando correctamente.</p>
      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Estado de la aplicación:</h2>
        <ul className="space-y-2">
          <li className="text-green-600">✅ React está funcionando</li>
          <li className="text-green-600">✅ Tailwind CSS está cargado</li>
          <li className="text-green-600">✅ El componente se renderiza</li>
        </ul>
      </div>
    </div>
  );
}

export default App;