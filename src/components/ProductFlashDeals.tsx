import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Card, Button } from './ui';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  imageUrl: string;
  name: string;
  category: string; // Added category property
  currentPrice: string;
  oldPrice?: string;
  optionsAvailable: boolean;
  shippingCost?: string;
  badge?: string; // "Precio reducido", "Liquidación"
  isFavorite?: boolean;
}

const flashDeals: Product[] = [
  {
    id: '1',
    imageUrl: '/inicio_images/smartwacht.png',
    name: 'Smartwatch deportivo con GPS y monitor de ritmo cardíaco',
    category: 'Tecnología', // Added category
    currentPrice: 'Bs.150.00',
    oldPrice: 'Bs.250.00',
    optionsAvailable: true,
    badge: 'Precio reducido',
    isFavorite: false,
  },
  {
    id: '2',
    imageUrl: '/inicio_images/auriculares_inalambricos.jpeg',
    name: 'Auriculares inalámbricos con cancelación de ruido',
    category: 'Tecnología', // Added category
    currentPrice: 'Bs.80.00',
    oldPrice: 'Bs.120.00',
    optionsAvailable: false,
    badge: 'Liquidación',
    isFavorite: true,
  },
  {
    id: '3',
    imageUrl: '/inicio_images/cafetera.jpg',
    name: 'Cafetera programable con molinillo integrado',
    category: 'Hogar', // Added category
    currentPrice: 'Bs.200.00',
    oldPrice: 'Bs.300.00',
    optionsAvailable: true,
    isFavorite: false,
  },
  {
    id: '4',
    imageUrl: '/inicio_images/set_sartenes.jpeg',
    name: 'Set de sartenes antiadherentes de cerámica (5 piezas)',
    category: 'Hogar', // Added category
    currentPrice: 'Bs.90.00',
    oldPrice: 'Bs.140.00',
    optionsAvailable: false,
    isFavorite: false,
  },
  {
    id: '5',
    imageUrl: '/inicio_images/mochila.jpg',
    name: 'Mochila de viaje impermeable con puerto USB de carga',
    category: 'Hogar', // Corrected category
    currentPrice: 'Bs.60.00',
    oldPrice: 'Bs.90.00',
    optionsAvailable: true,
    badge: 'Oferta',
    isFavorite: true,
  },
  {
    id: '6',
    imageUrl: '/inicio_images/lampara.jpg',
    name: 'Lámpara de escritorio LED con cargador inalámbrico',
    category: 'Hogar', // Added category
    currentPrice: 'Bs.45.00',
    oldPrice: 'Bs.70.00',
    optionsAvailable: false,
    isFavorite: false,
  },
  {
    id: '7',
    imageUrl: '/inicio_images/tegnologia_mejor_precio.jpg',
    name: 'Teclado mecánico RGB para Gaming',
    category: 'Tecnología', // Added category
    currentPrice: 'Bs.180.00',
    oldPrice: 'Bs.220.00',
    optionsAvailable: false,
    badge: 'Nuevo',
    isFavorite: false,
  },
  {
    id: '8',
    imageUrl: '/inicio_images/mouse_ergonomico.jpg',
    name: 'Mouse ergonómico inalámbrico', // Added name
    category: 'Tecnología', // Added category
    currentPrice: 'Bs.70.00',
    oldPrice: 'Bs.90.00',
    optionsAvailable: false,
    isFavorite: true,
  },
];

const createCategorySlug = (categoryName: string) => {
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

function ProductFlashDeals() {
  const navigate = useNavigate();

  const handleDetailsClick = (category: string) => {
    const slug = createCategorySlug(category);
    navigate(`/buy?category=${slug}`);
  };

  return (
    <section className="py-0 bg-gray-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ofertas Flash
          </h2>
          <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold">
            Ver todo <ArrowRight className="ml-1 w-5 h-5" />
          </Button>
        </div>

        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-6 lg:space-x-0 lg:overflow-x-hidden">
          {flashDeals.map((product) => (
            <Card key={product.id} className="flex-none w-64 lg:w-auto group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow duration-300 hover:shadow-xl">
              <div className="relative aspect-square w-full overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                <button className="absolute top-3 right-3 z-10 rounded-full bg-white/70 p-1.5 text-gray-500 backdrop-blur-sm transition-colors hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={product.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
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
                <Button 
                  variant="outline" 
                  className="mt-auto w-full rounded-lg border-blue-500 text-blue-500 hover:bg-blue-50"
                  onClick={() => handleDetailsClick(product.category)}
                >
                  Ver Detalles
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductFlashDeals;
