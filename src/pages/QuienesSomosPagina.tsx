import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Percent, Handshake, Users, ShoppingBag, ShieldCheck, Package, Truck, Star, QrCode, Search, Wallet, CheckCircle, Landmark, Smartphone, Factory, Globe, Verified, Rocket, UserPlus, Upload, DollarSign, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';

interface AboutUsPageProps {}

// Reusable FeatureCard component for advantages
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center border border-blue-100 animate-fade-in">
    <div className="text-blue-600 mb-4 text-4xl">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// Reusable StepCard component for processes
const StepCard = ({ num, icon, title, description }) => (
  <div className="relative p-6 bg-white rounded-lg shadow-md border border-indigo-100 animate-slide-up">
    <div className="absolute -top-4 -left-4 bg-indigo-500 text-white rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold shadow-md">
      {num}
    </div>
    <div className="text-indigo-600 mb-3 text-3xl flex justify-center">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{title}</h3>
    <p className="text-gray-600 text-sm text-center">{description}</p>
  </div>
);

function QuienesSomosPagina() {
  const navigate = useNavigate();
  const competitiveAdvantages = [
    {
      icon: <Percent />,
      title: "Comisiones Bajas",
      description: "Solo 2% por transacción vs 5-8% de la competencia. Maximiza tus ganancias."
    },
    {
      icon: <Smartphone />,
      title: "Diseño Mobile-First",
      description: "Optimizado para celulares, usado por el 85% de nuestros usuarios para una experiencia fluida."
    },
    {
      icon: <Factory />, // Changed from ShoppingBag to Factory for local production feel
      title: "Productos Locales",
      description: "Segunda mano, artesanías y productos 100% bolivianos. Apoya la economía local."
    },
    {
      icon: <Globe />, // Changed from Users to Globe for community feel
      title: "Comunidad Boliviana",
      description: "Interfaz en español adaptada a nuestros mercados, conectando a nuestra gente."
    },
    {
      icon: <Verified />, // Changed from ShieldCheck to Verified for CI verification
      title: "Verificación CI",
      description: "Máxima seguridad con la cédula de identidad boliviana, garantizando transacciones confiables."
    },
    {
      icon: <Handshake />, // Changed from HeartHandshake to Handshake for social impact
      title: "Impacto Social",
      description: "Apoyamos el crecimiento de microemprendedores del país, generando oportunidades."
    },
  ];

  const sellerProcessSteps = [
    {
      num: "01",
      icon: <UserPlus />,
      title: "Regístrate",
      description: "Crea tu cuenta gratis con tu CI boliviano en pocos minutos."
    },
    {
      num: "02",
      icon: <Upload />,
      title: "Publica",
      description: "Sube fotos de tus productos con descripciones simples y atractivas."
    },
    {
      num: "03",
      icon: <DollarSign />,
      title: "Recibe Pagos",
      description: "Cobra fácilmente con QR de Tigo Money, Yape, Alto Ke o Simple QR."
    },
    {
      num: "04",
      icon: <Truck />,
      title: "Entrega",
      description: "Coordina la entrega directamente con el comprador de forma eficiente."
    },
  ];

  const buyerProcessSteps = [
    {
      num: "01",
      icon: <Search />,
      title: "Explora",
      description: "Busca por categorías y encuentra tesoros locales y productos únicos."
    },
    {
      num: "02",
      icon: <Wallet />,
      title: "Paga con QR",
      description: "Usa tu app preferida para un pago rápido, seguro y sin complicaciones."
    },
    {
      num: "03",
      icon: <MapPin />,
      title: "Recibe",
      description: "Coordina la entrega directamente con el vendedor y disfruta tu compra."
    },
  ];

  const paymentMethods = [
    {
      icon: <QrCode />,
      title: "Tigo Money QR",
      description: "Pago instantáneo con tu celular Tigo."
    },
    {
      icon: <Landmark />,
      title: "Yape Bolivia",
      description: "Transferencias rápidas y seguras desde BCP."
    },
    {
      icon: <QrCode />,
      title: "Alto Ke QR",
      description: "Sistema de pago popular del BancoSol."
    },
    {
      icon: <QrCode />,
      title: "Simple QR",
      description: "Una solución universal para todos los bancos."
    },
    {
      icon: <QrCode />,
      title: "QR Universal",
      description: "Un solo código para todos los métodos de pago."
    },
    {
      icon: <ShieldCheck />,
      title: "Verificación CI",
      description: "Seguridad adicional con cédula de identidad."
    },
    {
      icon: <CheckCircle />,
      title: "Confirmación Instantánea",
      description: "Notificación inmediata de pago recibido."
    },
  ];

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
            <header className="relative bg-[url('/images/ai-generative-e-commerce-concept-shopping-cart-with-boxes-on-a-wooden-table-photo.jpg')] bg-cover bg-center h-64 flex items-center justify-center shadow-lg">
              <div className="absolute inset-0 bg-black opacity-60"></div>
              <div className="relative z-10 text-white text-center">
                <h1 className="text-5xl font-extrabold mb-4 animate-fade-in-down animation-delay-100">Conoce Mercado Express</h1>
                <p className="text-xl max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                  Tu plataforma de confianza para conectar con lo mejor de Bolivia.
                </p>
              </div>
            </header>
      
            {/* Competitive Advantages Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-12 animate-fade-in animation-delay-300">
                  🏆 Ventajas Competitivas
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-16 animate-fade-in animation-delay-400">
                  ¿Por qué elegir Mercado Express? Ventajas únicas frente a Facebook Marketplace y Mercado Libre que hacen la diferencia.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {competitiveAdvantages.map((feature, index) => (
                    <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
                  ))}
                </div>
              </div>
            </section>
      
            {/* Seller Process Section */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-12 animate-fade-in animation-delay-500">
                  🚀 Proceso Simplificado para Vendedores
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-16 animate-fade-in animation-delay-600">
                  En 4 pasos simples comenzá a vender tus productos y alcanzá miles de compradores.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  {sellerProcessSteps.map((step, index) => (
                    <StepCard key={index} num={step.num} icon={step.icon} title={step.title} description={step.description} />
                  ))}
                </div>
              </div>
            </section>
      
            {/* Buyer Process Section */}
            <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-12 animate-fade-in animation-delay-700">
                  🛍️ ¿Eres Comprador?
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-16 animate-fade-in animation-delay-800">
                  Descubre productos únicos cerca de ti en 3 simples pasos.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {buyerProcessSteps.map((step, index) => (
                    <StepCard key={index} num={step.num} icon={step.icon} title={step.title} description={step.description} />
                  ))}
                </div>
                <div className="mt-16 animate-fade-in animation-delay-900">
                  <Button size="lg" variant="primary" onClick={() => navigate('/comprar')}>
                    Explorar Productos Ahora
                  </Button>
                </div>
              </div>
            </section>
      
            {/* Payment Methods Section */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-12 animate-fade-in animation-delay-1000">
                  💳 Pagos Locales
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-16 animate-fade-in animation-delay-1100">
                  Integración completa con los sistemas de pago QR más populares y confiables de Bolivia.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {paymentMethods.map((method, index) => (
                    <FeatureCard key={index} icon={method.icon} title={method.title} description={method.description} />
                  ))}
                </div>
                <div className="mt-16 p-8 bg-blue-50 rounded-lg shadow-inner animate-fade-in animation-delay-1200">
                  <h3 className="text-3xl font-bold text-blue-800 mb-4">Pago Seguro y Verificado</h3>
                  <p className="text-lg text-blue-700 max-w-2xl mx-auto">
                    Cada transacción incluye la verificación de la Cédula de Identidad para tu tranquilidad,
                    asegurando que cada pago sea rastreable y seguro.
                  </p>
                  <div className="flex justify-center items-center gap-8 mt-8">
                    <div className="flex flex-col items-center text-blue-600">
                      <QrCode size={48} />
                      <span className="mt-2 font-semibold">QR Universal</span>
                    </div>
                    <div className="flex flex-col items-center text-blue-600">
                      <ShieldCheck size={48} />
                      <span className="mt-2 font-semibold">CI Verificado</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
      
            {/* Call to Action Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                <h3 className="text-4xl font-bold mb-8 animate-fade-in animation-delay-1300">¡Únete a Nuestra Comunidad!</h3>
                <p className="text-xl max-w-3xl mx-auto mb-12 animate-fade-in animation-delay-1400">
                  Descubre productos increíbles o empieza a vender hoy mismo.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in animation-delay-1500">
                  <Button size="lg" variant="light" onClick={() => navigate('/comprar')}>
                    Explorar Productos Ahora
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/vender')}>
                    ¡Quiero Vender!
                  </Button>
                </div>
              </div>
            </section>
    </div>
  );
}

export default QuienesSomosPagina;