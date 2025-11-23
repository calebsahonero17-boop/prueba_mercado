import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Card, Button } from './ui';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  category: string; // Added category property
  currentPrice: string;
  oldPrice?: string;
  badge?: string; // e.g., "Nuevo", "Oferta", "Precio reducido", "Liquidación"
  isFavorite?: boolean;
  optionsAvailable?: boolean;
  shippingCost?: string;
}

const createCategorySlug = (categoryName: string) => {
  if (!categoryName) return '';
  return categoryName
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[\u00e1]/g, 'a')
    .replace(/[\u00e9]/g, 'e')
    .replace(/[\u00ed]/g, 'i')
    .replace(/[\u00f3]/g, 'o')
    .replace(/[\u00fa]/g, 'u')
    .replace(/[\u00f1]/g, 'n')
    .replace(/[^\w-]+/g, '');
};

const sportsDeals: Product[] = [ // Renamed from flashDeals
  {
    id: '2',
    imageUrl: '/inicio_images/pelota.jpeg',
    name: 'Pelota de Fútbol',
    category: 'Deporte', // Added category
    currentPrice: 'Bs.80.00',
    oldPrice: 'Bs.120.00',
    optionsAvailable: false,
    badge: 'Liquidación',
    isFavorite: true,
  },
  {
    id: '3',
    imageUrl: '/inicio_images/raqueta.webp',
    name: 'Raqueta de Tenis',
    category: 'Deporte', // Added category
    currentPrice: 'Bs.200.00',
    oldPrice: 'Bs.300.00',
    optionsAvailable: true,
    isFavorite: false,
  },
  {
    id: '4',
    imageUrl: '/inicio_images/balon_baloncesto.webp',
    name: 'Balón de Baloncesto',
    category: 'Deporte', // Added category
    currentPrice: 'Bs.90.00',
    oldPrice: 'Bs.140.00',
    optionsAvailable: false,
    isFavorite: false,
  },
  {
    id: '5',
    imageUrl: '/inicio_images/guantes_boxeo.jpg',
    name: 'Guantes de Boxeo',
    category: 'Deporte', // Added category
    currentPrice: 'Bs.60.00',
    oldPrice: 'Bs.90.00',
    optionsAvailable: true,
    badge: 'Oferta',
    isFavorite: true,
  },
  {
    id: '6',
    imageUrl: '/inicio_images/red_voleibol.webp',
    name: 'Red de Voleibol',
    category: 'Deporte', // Added category
    currentPrice: 'Bs.45.00',
    oldPrice: 'Bs.70.00',
    optionsAvailable: false,
    isFavorite: false,
  },
  {
    id: '7',
    imageUrl: '/inicio_images/pesa_rusa.jpg',
    name: 'Pesa Rusa',
    category: 'Deporte', // Added category
    currentPrice: 'Bs.180.00',
    oldPrice: 'Bs.220.00',
    optionsAvailable: false,
    badge: 'Nuevo',
    isFavorite: false,
  },
  {
    id: '8',
    imageUrl: '/inicio_images/cuerda_saltar.jpg',
    name: 'Cuerda para Saltar',
    category: 'Deporte', // Added category
    currentPrice: 'Bs.70.00',
    oldPrice: 'Bs.90.00',
    optionsAvailable: false,
  },
];




const allElectronicsProducts: Product[] = [
  {
    id: 'elec1',
    imageUrl: '/inicio_images/laptop_ultrabook.jpg',
    name: 'Laptop Ultrabook 14" Intel i7, 16GB RAM, 512GB SSD',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.4500.00',
    oldPrice: 'Bs.5200.00',
    badge: 'Nuevo',
    isFavorite: false,
  },
  {
    id: 'elec2',
    imageUrl: '/inicio_images/auriculares_bluetoh.jpg',
    name: 'Auriculares Bluetooth con cancelación de ruido activa',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.350.00',
    oldPrice: 'Bs.420.00',
    badge: 'Oferta',
    isFavorite: true,
  },
  {
    id: 'elec3',
    imageUrl: '/inicio_images/android_smarphone.avif',
    name: 'Smartphone Android 5G, 128GB, Cámara 108MP',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.2800.00',
    oldPrice: 'Bs.3100.00',
    isFavorite: false,
  },
  {
    id: 'elec4_new',
    imageUrl: '/inicio_images/tegnologia.jpeg', // Using a generic tech image
    name: 'Tablet de 10 pulgadas, 64GB, Wi-Fi',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.1200.00',
    oldPrice: 'Bs.1500.00',
    badge: 'Oferta',
    isFavorite: false,
  },
  {
    id: 'elec5',
    imageUrl: '/inicio_images/auriculares_bluetoh.jpg',
    name: 'Auriculares Inalámbricos Pro',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.400.00',
    oldPrice: 'Bs.500.00',
    badge: 'Nuevo',
    isFavorite: false,
  },
  {
    id: 'elec6',
    imageUrl: '/inicio_images/laptop_ultrabook.jpg',
    name: 'Laptop Gaming Ultra',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.6000.00',
    oldPrice: 'Bs.7500.00',
  },
  {
    id: 'elec7',
    imageUrl: '/inicio_images/smart_tv.jpeg',
    name: 'Smart TV 4K de 55 pulgadas',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.3500.00',
    oldPrice: 'Bs.4000.00',
    badge: 'Nuevo',
    isFavorite: false,
  },
  {
    id: 'elec8',
    imageUrl: '/inicio_images/monitor_curvo.png',
    name: 'Monitor Curvo Gamer 27"',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.1800.00',
    oldPrice: 'Bs.2200.00',
    badge: 'Oferta',
    isFavorite: true,
  },
  {
    id: 'elec9',
    imageUrl: '/inicio_images/camara_wifi.jpeg',
    name: 'Cámara de Seguridad Wi-Fi',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.450.00',
    oldPrice: 'Bs.550.00',
    isFavorite: false,
  },
  {
    id: 'elec10',
    imageUrl: '/inicio_images/impresora_laser.jpeg',
    name: 'Impresora Multifuncional Láser',
    category: 'Tecnología', // Changed to 'Tecnología'
    currentPrice: 'Bs.900.00',
    oldPrice: 'Bs.1100.00',
    badge: 'Descuento',
    isFavorite: false,
  },
];



function FeaturedElectronics() {
  const navigate = useNavigate();

  const handleDetailsClick = (category: string) => {
    const slug = createCategorySlug(category);
    navigate(`/buy?category=${slug}`);
  };

  return (
    <>
      <section className="py-0 pt-4 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Electrónicos destacados
            </h2>
            <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold" onClick={() => handleDetailsClick('Tecnología')}>
              Ver todo <ArrowRight className="ml-1 w-5 h-5" />
            </Button>
          </div>

          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-6 lg:space-x-0 lg:overflow-x-hidden">
            {allElectronicsProducts.map((product) => (
              <Card key={product.id} className="flex-none w-64 lg:w-auto group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow duration-300 hover:shadow-xl">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  {product.badge && (
                    <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${product.badge === 'Oferta' ? 'bg-red-600' : 'bg-blue-600'}`}>
                      {product.badge}
                    </span>
                  )}
                  <button className="absolute top-3 right-3 z-10 rounded-full bg-white/70 p-1.5 text-gray-500 backdrop-blur-sm transition-colors hover:text-red-500">
                    <Heart size={20} fill={product.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-semibold text-blue-600 uppercase mb-1">{product.category}</span> {/* Added category display */}
                  <h3 className="text-sm font-semibold text-gray-800 mb-1.5 line-clamp-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold text-gray-900">{product.currentPrice}</span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                    )}
                  </div>
                  <Button variant="outline" className="mt-auto w-full rounded-lg" onClick={() => handleDetailsClick(product.category)}>
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
                                    {/* Sección de Video */}
                                    <section className="py-8 bg-cover bg-center h-16 flex items-center justify-center" style={{ backgroundImage: 'url("/images/fondo_verde.jpg")' }}>                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
                                                                        <h2 className="text-xl sm:text-4xl font-bold drop-shadow-lg animate-blink" style={{ textShadow: '0 0 8px rgba(255,255,255,0.8)' }}>
                                                                          Mira nuestras últimas ofertas
                                                                        </h2>                    </div>
                  </section>      {/* Nueva sección para Ofertas Deportivas */}
      <section className="py-8 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Ofertas Deportivas
            </h2>
            <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold" onClick={() => handleDetailsClick('Deporte')}>
              Ver todo <ArrowRight className="ml-1 w-5 h-5" />
            </Button>
          </div>

          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-6 lg:space-x-0 lg:overflow-x-hidden">
            {sportsDeals.map((product) => (
              <Card key={product.id} className="flex-none w-64 lg:w-auto group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow duration-300 hover:shadow-xl">
                <div className="relative aspect-square w-full overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  {product.badge && (
                    <span className={`absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full ${product.badge === 'Oferta' ? 'bg-red-600' : 'bg-blue-600'}`}>
                      {product.badge}
                    </span>
                  )}
                  <button className="absolute top-3 right-3 z-10 rounded-full bg-white/70 p-1.5 text-gray-500 backdrop-blur-sm transition-colors hover:text-red-500">
                    <Heart size={20} fill={product.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs font-semibold text-blue-600 uppercase mb-1">{product.category}</span> {/* Added category display */}
                  <h3 className="text-sm font-semibold text-gray-800 mb-1.5 line-clamp-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-lg font-bold text-gray-900">{product.currentPrice}</span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                    )}
                  </div>
                  <Button variant="outline" className="mt-auto w-full rounded-lg border-blue-500 text-blue-500 hover:bg-blue-50" onClick={() => handleDetailsClick(product.category)}>
                    Ver Detalles
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      

    </>
  );
}

export default FeaturedElectronics;
