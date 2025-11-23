import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

import { Button } from './ui';

const PromoBanner = () => {
  const navigate = useNavigate(); // Inicializar useNavigate

  return (
    <div className="w-full max-w-[1800px] mx-auto h-auto lg:min-h-[25px] relative animate-fade-in bg-cover bg-center text-white flex items-center justify-between px-4 sm:px-6 py-1" style={{ backgroundImage: 'url("/inicio_images/blueeeee.jpg")' }}>
          {/* Subtle glow effect - Re-adding if it was part of the original design and still desired */}
          <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)' }}></div>
    
          {/* Left: 3D Shopping Bag with QR */}
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 relative z-10">
            <img src="/inicio_images/bolsa_qr.webp" alt="Shopping bag with QR code" className="w-full h-full object-contain drop-shadow-md" />
          </div>
    
          {/* Center: Text Content with Icons */}
          <div className="flex items-center flex-wrap justify-center text-center mx-2 sm:mx-4 space-x-1 sm:space-x-2 z-10">
                                    <h2 className="text-xs sm:text-base md:text-base font-extrabold font-sans tracking-wide leading-tight drop-shadow-md animate-bounce">
                                      Mercado Express: Pagos QR, vendedores verificados, todo lo que buscas.
                                    </h2>          </div>
    
          {/* Right: Button */}
          <div className="z-10">
            <Button
              variant="default"
              onClick={() => navigate('/comprar')} // Añadir el manejador onClick
                                                                          className="relative bg-white border-8 border-green-900 text-green-800 font-bold py-1 px-3 sm:py-2 sm:px-4 rounded-full
                                                                                     hover:bg-green-50 transition-all duration-300 hover:scale-105
                                                                                     before:content-[''] before:absolute before:inset-0 before:rounded-full
                                                                                     before:bg-white before:opacity-0 before:hover:opacity-30 before:transition-opacity
                                                                                     before:blur-sm before:scale-105 text-sm sm:text-base"            >
              Explorar
            </Button>
          </div>
        </div>
      );};

export default PromoBanner;
