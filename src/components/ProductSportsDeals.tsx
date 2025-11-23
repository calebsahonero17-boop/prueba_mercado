import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Card, Button } from './ui';

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  currentPrice: string;
  oldPrice?: string;
  optionsAvailable: boolean;
  shippingCost?: string;
  badge?: string; // "Precio reducido", "Liquidación"
  isFavorite?: boolean;
}

const sportsDeals: Product[] = [
  {
    id: 'sport1',
    imageUrl: '/inicio_images/deporte_categoria.jpg', // Placeholder image
    name: 'Zapatillas deportivas de running',
    currentPrice: 'Bs.300.00',
    oldPrice: 'Bs.450.00',
    optionsAvailable: true,
    badge: 'Nuevo',
    isFavorite: false,
  },
  {
    id: 'sport2',
    imageUrl: '/inicio_images/deporte_categoria.jpg', // Placeholder image
    name: 'Set de mancuernas ajustables (20kg)',
    currentPrice: 'Bs.500.00',
    oldPrice: 'Bs.700.00',
    optionsAvailable: false,
    badge: 'Oferta',
    isFavorite: true,
  },
  {
    id: 'sport3',
    imageUrl: '/inicio_images/deporte_categoria.jpg', // Placeholder image
    name: 'Bicicleta de montaña rodado 29',
    currentPrice: 'Bs.2500.00',
    oldPrice: 'Bs.3200.00',
    optionsAvailable: true,
    isFavorite: false,
  },
  {
    id: 'sport4',
    imageUrl: '/inicio_images/deporte_categoria.jpg', // Placeholder image
    name: 'Reloj deportivo con GPS y pulsómetro',
    currentPrice: 'Bs.400.00',
    oldPrice: 'Bs.600.00',
    optionsAvailable: false,
    isFavorite: false,
  },
  {
    id: 'sport5',
    imageUrl: '/inicio_images/deporte_categoria.jpg', // Placeholder image
    name: 'Mochila de hidratación para trail running',
    currentPrice: 'Bs.150.00',
    oldPrice: 'Bs.200.00',
    optionsAvailable: true,
    badge: 'Liquidación',
    isFavorite: true,
  },
  {
    id: 'sport6',
    imageUrl: '/inicio_images/deporte_categoria.jpg', // Placeholder image
    name: 'Cuerda para saltar de velocidad',
    currentPrice: 'Bs.50.00',
    oldPrice: 'Bs.80.00',
    optionsAvailable: false,
    isFavorite: false,
  },
  {
    id: 'elec4',
    imageUrl: '/inicio_images/smartchatt_salud.jpeg',
    name: 'Smartwatch deportivo con GPS y monitor de salud',
    currentPrice: 'Bs.700.00',
    oldPrice: 'Bs.850.00',
    isFavorite: false,
    optionsAvailable: false,
    shippingCost: undefined,
  },
  {
    id: 'flash1',
    imageUrl: '/inicio_images/smartwacht.png',
    name: 'Smartwatch deportivo con GPS y monitor de ritmo cardíaco',
    currentPrice: 'Bs.150.00',
    oldPrice: 'Bs.250.00',
    optionsAvailable: true,
    badge: 'Precio reducido',
    isFavorite: false,
  },
];

function ProductSportsDeals() {
  return (
    <section className="py-8 bg-gray-50"> {/* Added padding for visibility */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ofertas en Deportes
          </h2>
          <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold">
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
                <h3 className="text-sm font-semibold text-gray-800 mb-1.5 line-clamp-2">{product.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">{product.currentPrice}</span>
                  {product.oldPrice && (
                    <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                  )}
                </div>
                <Button variant="outline" className="mt-auto w-full rounded-lg border-blue-500 text-blue-500 hover:bg-blue-50">
                  Ver Detalles
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );n}

export default ProductSportsDeals;
