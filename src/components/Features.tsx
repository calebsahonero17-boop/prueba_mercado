import React from 'react';
import { Card } from './ui';

function Features() {
  const features = [
    {
      imageUrl: "/images/comisiones_bajas.webp",
      title: "Comisiones Bajas",
      description: "Solo 2% por transacción vs 5-8% de la competencia",
      color: "bg-green-600",
      borderColor: "border-green-200",
      iconColor: "text-white",
      bgColorClass: "bg-green-200"
    },
    {
      imageUrl: "/images/mobile_firts.png",
      title: "Diseño Mobile-First",
      description: "Optimizado para celulares, 85% de nuestros usuarios",
      color: "bg-blue-600",
      borderColor: "border-blue-200",
      iconColor: "text-white",
      bgColorClass: "bg-blue-200"
    },
    {
      imageUrl: "/images/producto_local.jpg",
      title: "Productos Locales",
      description: "Segunda mano, artesanías y productos bolivianos",
      color: "bg-white",
      borderColor: "border-gray-200",
      iconColor: "text-blue-600",
      bgColorClass: "bg-gray-200"
    },
    {
      imageUrl: "/images/comunidad_bo.webp",
      title: "Comunidad Boliviana",
      description: "Interfaz en español adaptada a nuestros mercados",
      color: "bg-green-600",
      borderColor: "border-green-200",
      iconColor: "text-white",
      bgColorClass: "bg-green-200"
    },
    {
      imageUrl: "/images/verificar_cI.png",
      title: "Verificación CI",
      description: "Seguridad con cédula de identidad boliviana",
      color: "bg-blue-600",
      borderColor: "border-blue-200",
      iconColor: "text-white",
      bgColorClass: "bg-blue-200"
    },
    {
      imageUrl: "/images/impacto_social.webp",
      title: "Impacto Social",
      description: "Apoyamos el crecimiento de microemprendedores",
      color: "bg-white",
      borderColor: "border-gray-200",
      iconColor: "text-blue-600",
      bgColorClass: "bg-gray-200"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium mb-4">
            🏆 Ventajas Competitivas
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            ¿Por qué elegir <span className="text-blue-600">Mercado Express</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ventajas únicas frente a Facebook Marketplace y Mercado Libre que hacen la diferencia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              hover={true}
              className={`relative text-center animate-fade-in group border-2 ${feature.borderColor} animate-blink`}
              style={{ animationDelay: `${index * 100}ms` }}
            >

                              <img src={feature.imageUrl} alt={feature.title} className="absolute inset-0 w-full h-full object-contain opacity-30 rounded-xl group-hover:opacity-40 transition-all duration-300" />              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Video Section */}
        <div className="my-16 lg:my-20 text-center">
          <video 
            className="w-full max-w-7xl mx-auto rounded-lg shadow-xl" 
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/videos/ENUNCIANTE_HORIZONTAL.mp4" type="video/mp4" />
            Tu navegador no soporta la etiqueta de video.
          </video>
        </div>
      </div>
    </section>
  );
}

export default Features;