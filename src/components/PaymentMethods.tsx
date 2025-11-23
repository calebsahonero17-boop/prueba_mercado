import React from 'react';
import { QrCode, Shield, CheckCircle } from 'lucide-react';
import Card from './ui/Card';

function PaymentMethods() {
  const paymentMethods = [
    {
      name: "Tigo Money QR",
      description: "Pago instantáneo con tu celular Tigo.",
      logo: "/images/tigomoney.webp"
    },
    {
      name: "Yape Bolivia",
      description: "Transferencias rápidas y seguras desde BCP.",
      logo: "/images/yape_bolivia.webp"
    },
    {
      name: "Alto Ke QR",
      description: "Sistema de pago popular del BancoSol.",
      logo: "/images/altoke_qr.png"
    },
    {
      name: "Simple QR",
      description: "Una solución universal para todos los bancos.",
      logo: null
    }
  ];

  const features = [
    {
      icon: QrCode,
      title: "QR Universal",
      description: "Un solo código para todos los métodos de pago."
    },
    {
      icon: Shield,
      title: "Verificación CI",
      description: "Seguridad adicional con cédula de identidad."
    },
    {
      icon: CheckCircle,
      title: "Confirmación Instantánea",
      description: "Notificación inmediata de pago recibido."
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium mb-4">
            💳 Pagos Locales
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Métodos de <span className="text-blue-600">Pago Bolivianos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Integración completa con los sistemas de pago QR más populares y confiables de Bolivia.
          </p>
        </div>

        {/* Redesigned Payment Methods Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 lg:mb-20">
          {paymentMethods.map((method, index) => (
            <Card key={index} variant="default" hover={true} className="flex flex-col items-center justify-center text-center p-6">
              <div className="w-24 h-16 flex items-center justify-center mb-4">
                {method.logo ? (
                  <img src={method.logo} alt={method.name} className="max-h-12 object-contain" />
                ) : (
                  <QrCode className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-800 text-md mb-1">
                {method.name}
              </h3>
              <p className="text-gray-500 text-sm">
                {method.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Redesigned Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className={`rounded-2xl p-8 text-white ${index % 2 === 0 ? 'bg-blue-600' : 'bg-green-600'}`}>
              <feature.icon className="w-10 h-10 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-3">
                {feature.title}
              </h3>
              <p className="opacity-90">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Redesigned QR Demo */}
        <div className="mt-16 lg:mt-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 text-center text-white flex flex-col lg:flex-row items-center justify-between">
          <div className="lg:text-left lg:w-1/2 mb-8 lg:mb-0">
            <h3 className="text-3xl font-bold mb-4">
              Pago Seguro y Verificado
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl">
              Cada transacción incluye la verificación de la Cédula de Identidad para tu tranquilidad, asegurando que cada pago sea rastreable y seguro.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 w-full max-w-xs text-gray-900">
            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-300">
              <QrCode className="w-20 h-20 text-gray-400" />
            </div>
            <p className="font-bold mb-2">Código QR Universal</p>
            <div className="bg-green-100 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 font-medium flex items-center justify-center">
                <Shield className="w-4 h-4 mr-2"/> CI Verificado
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default PaymentMethods;