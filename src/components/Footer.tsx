import React from 'react';
import { Facebook, Twitter, Mail } from 'lucide-react'; // Solo importamos los que vamos a usar
import { Link } from 'react-router-dom'; // Para el logo/nombre si se necesita navegar

interface FooterProps {}

function Footer({}: FooterProps) { // onNavigate ya no se usa
  // Las definiciones de quickLinks, legalLinks, socialLinks ya no son necesarias si no se usan
  // Pero las mantendré comentadas por si el usuario quiere reutilizarlas en el futuro.
  /*
  const quickLinks = [
    { label: 'Inicio', page: 'home' },
    { label: 'Comprar', page: 'buy' },
    { label: 'Vender', page: 'sell' },
    { label: 'Preguntas Frecuentes', page: 'faq' },
  ];

  const legalLinks = [
    { label: 'Centro de Ayuda', page: 'contact' },
    { label: 'Términos y Condiciones', page: 'terms' },
    { label: 'Política de Privacidad', page: 'privacy' },
    { label: 'Política de Cookies', page: 'cookies' },
  ];
  */

  return (
    <footer className="bg-blue-900 text-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">

          {/* Columna izquierda: Logo/Nombre y Descripción */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="mb-4">
              <img src="/imagen_sin_fondo.png" alt="Mercado Express Bolivia Logo" className="h-28" /> {/* Ajustar tamaño del logo */}
            </Link>
            <h3 className="text-xl font-semibold mb-2">Mercado Express Bolivia</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Tu mercado digital de confianza.
            </p>
          </div>

          {/* Columna central: Información de contacto y redes sociales */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-lg font-semibold mb-4">Contáctanos</h3>
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 mr-2 text-blue-300" />
              <a href="mailto:mercadoexpressbolivia@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                mercadoexpressbolivia@gmail.com
              </a>
            </div>
            <h3 className="text-lg font-semibold mb-4">Síguenos en redes sociales</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/MercadoExpressBoliviaOficial" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://twitter.com/MercadoExpressBO" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Columna derecha: Espacio para Código QR */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <h3 className="text-lg font-semibold mb-4">Escanea el código QR para comunicarte con nosotros</h3>
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-center w-32 h-32">
              <img src="/inicio_images/QR_ATENCION_AL_CLIENTE.png" alt="Código QR de contacto" className="w-full h-full object-contain" />
            </div>
          </div>

        </div>

        {/* Sección de derechos de autor */}
        <div className="border-t border-blue-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Mercado Express Bolivia – Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;