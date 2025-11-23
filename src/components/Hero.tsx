import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart, Store, Zap } from 'lucide-react';
import { Button } from './ui';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const slides = [
  {
    button: {
      text: "Vender Ahora",
      page: "sell",
      variant: "primary",
    },
    textColor: "text-gray-800",
    iconColor: "text-yellow-300",
    imageUrl: "/inicio_images/tegnologia_mejor_precio.jpg",
  },
  {
    button: {
      text: "Comprar con QR",
      page: "buy",
      variant: "primary",
    },
    textColor: "text-gray-800",
    iconColor: "text-yellow-300",
    imageUrl: "/images/IMAGEN_CARRUSEL.jpg",
  },
  {
    button: {
      text: "Saber Más",
      page: "faq",
      variant: "outline",
      className: "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
    },
    textColor: "text-gray-800",
    imageUrl: "/images/IMAGEN_CARRUSEL.jpg",
  },
  {
    button: {
      text: "Ofertas del Día",
      page: "buy",
      variant: "primary",
    },
    textColor: "text-gray-800",
    iconColor: "text-yellow-300",
    imageUrl: "/images/disposicion-carros-compras-viernes-negro-espacio-copiar_23-2148667047.jpg",
  },
];

function Hero({ onNavigate }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 7000); // Auto-slide every 7 seconds
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section className="relative w-full h-[40vh] md:h-[50vh] lg:h-[65vh] overflow-hidden">
      {/* Slides Container */}
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`w-full h-full flex-shrink-0 flex justify-center items-center relative`}
          >
            {slide.imageUrl && (
              <img
                src={slide.imageUrl}
                alt="Carousel background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-center bg-black/50 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight drop-shadow-lg">
                  Tu Mercado Digital en Bolivia
                </h2>
                <p className="mt-4 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-lg">
                  Conectando compradores y vendedores con productos únicos y locales.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation and Dots removed as per user request */}
    </section>
  );
}

export default Hero;
