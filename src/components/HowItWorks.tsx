import React from 'react';
import { FilePenLine, Camera, QrCode, Truck, Search, Smartphone, Handshake } from 'lucide-react';
import Card, { CardHeader, CardContent } from './ui/Card';

interface HowItWorksProps {
  onNavigate: (page: string) => void;
}

function HowItWorks({ onNavigate }: HowItWorksProps) {
  const steps = [
    {
      icon: FilePenLine,
      title: "Registrate",
      description: "Crea tu cuenta gratis con tu CI boliviano",
    },
    {
      icon: Camera,
      title: "Publica",
      description: "Sube fotos de tus productos con descripciones simples",
    },
    {
      icon: QrCode,
      title: "Recibe Pagos",
      description: "Cobra con QR de Tigo Money, Yape, Alto Ke o Simple QR",
    },
    {
      icon: Truck,
      title: "Entrega",
      description: "Coordina la entrega directamente con el comprador",
    }
  ];

  const buyerSteps = [
    {
      icon: Search,
      title: "Explora",
      description: "Busca por categorías y encuentra tesoros locales.",
    },
    {
      icon: Smartphone,
      title: "Paga con QR",
      description: "Usa tu app preferida para un pago rápido y seguro.",
    },
    {
      icon: Handshake,
      title: "Recibe",
      description: "Coordina la entrega directamente con el vendedor.",
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium mb-4">
            🚀 Proceso Simplificado para Vendedores
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            ¿Cómo <span className="text-blue-600">funciona</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            En 4 pasos simples comenzá a vender tus productos y alcanzá miles de compradores
          </p>
        </div>

        {/* Redesigned Seller Steps */}
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200" style={{ transform: 'translateY(-50%)', zIndex: 0 }}></div>
          
          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative z-10">
                <Card 
                  variant="default" 
                  padding="lg" 
                  hover={true}
                  className="h-full text-left"
                >
                  <CardHeader className="mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-6xl font-bold text-gray-200">0{index + 1}</span>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Redesigned Buyer Section */}
        <div className="mt-24 lg:mt-32 text-center">
          <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-8 lg:p-12 shadow-lg max-w-6xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Eres Comprador?
            </h3>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Descubre productos únicos cerca de ti en 3 simples pasos.
            </p>
            
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
              {buyerSteps.map((step, index) => (
                <div key={index} className="relative z-10">
                  <Card 
                    variant="default" 
                    padding="lg" 
                    hover={true}
                    className="h-full text-left bg-white/70 backdrop-blur-sm"
                  >
                    <CardHeader className="mb-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-6xl font-bold text-gray-200">0{index + 1}</span>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <step.icon className="w-8 h-8 text-green-600" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {step.title}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <button 
                onClick={() => onNavigate('buy')}
                className="bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold px-10 py-4 rounded-xl hover:from-blue-700 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Explorar Productos Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;