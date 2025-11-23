import React, { useState, useEffect } from 'react';

const images = [
  '/images/IMAGEN_CARRUSEL.jpg',
  '/inicio_images/tegnologia_mejor_precio.jpg',
  '/images/disposicion-carros-compras-viernes-negro-espacio-copiar_23-2148667047.jpg',
  '/inicio_images/moda_familia.jpg',
  '/inicio_images/muebles_decoracion.jpg',
  '/inicio_images/belleza_cuidado.avif',
];

const gradients = [
  'from-green-220 via-blue-200 to-green-200',
  'from-blue-200 via-green-200 to-blue-200',
  'from-green-200 via-blue-200 to-green-200',
  'from-blue-200 via-green-200 to-blue-200',
  'from-green-200 via-blue-200 to-green-200',
  'from-blue-200 via-green-200 to-blue-200',
];

const ThreeDCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change slide every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const getSlideClasses = (index: number) => {
    let classes = "absolute transition-all duration-700 ease-in-out";
    const totalImages = images.length;

    const prevIndex = (currentIndex - 1 + totalImages) % totalImages;
    const nextIndex = (currentIndex + 1) % totalImages;

    if (index === currentIndex) {
      // Center image
      classes += " w-3/5 h-full z-20 opacity-100 scale-100";
      classes += " left-1/2 -translate-x-1/2";
    } else if (index === prevIndex) {
      // Left image
      classes += " w-2/5 h-4/5 z-10 opacity-70 scale-90";
      classes += " left-0";
    } else if (index === nextIndex) {
      // Right image
      classes += " w-2/5 h-4/5 z-10 opacity-70 scale-90";
      classes += " right-0";
    } else {
      // Hidden images
      classes += " w-0 h-0 opacity-0";
    }
    return classes;
  };

  return (
    <section className="relative w-full h-[200px] sm:h-[300px] overflow-hidden bg-gradient-to-r from-green-700 via-blue-300 to-green-700">
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`flex items-center justify-center ${getSlideClasses(index)}`}
            style={{ top: '50%', transform: index === currentIndex ? 'translateY(-50%) translateX(-50%)' : index === (currentIndex - 1 + images.length) % images.length ? 'translateY(-50%)' : 'translateY(-50%)' }}
          >
            <div className="relative w-full h-full rounded-xl shadow-xl flex items-center justify-center overflow-hidden border border-gray-100">
              <img src={image} alt={`Slide ${index + 1}`} className="w-full h-full object-contain" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ThreeDCarousel;
