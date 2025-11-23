import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui';
import { useNavigate } from 'react-router-dom';

interface PromotionalBlockProps {
  id: string;
  imageUrl?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  layout: 'default' | 'large' | 'imageRight' | 'centeredImage'; // Custom layouts
  bgColor?: string; // Optional background color
  textColor?: string; // Optional text color
  category: string; // Added category
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

const promotionalData: PromotionalBlockProps[] = [
  {
    id: 'promo1',
    imageUrl: '/inicio_images/tegnologia_mejor_precio.jpg',
    title: 'Ahorra más este mes',
    subtitle: 'Grandes descuentos en tus marcas favoritas.',
    buttonText: 'Ver Detalles',
    buttonLink: '#',
    layout: 'large',
    textColor: 'text-white',
    category: 'Tecnología',
  },
  {
    id: 'promo2',
    imageUrl: '/inicio_images/smartwacht.png',
    title: 'Tecnología al mejor precio',
    subtitle: 'Descubre las últimas novedades.',
    buttonText: 'Ver Detalles',
    buttonLink: '#',
    layout: 'imageRight',
    category: 'Tecnología',
  },
  {
    id: 'promo3',
    imageUrl: '/inicio_images/moda_familia.jpg',
    title: 'Moda para toda la familia',
    subtitle: 'Estilo y comodidad garantizados.',
    buttonText: 'Ver Detalles',
    buttonLink: '#',
    layout: 'imageRight',
    category: 'Moda',
  },
  {
    id: 'promo4',
    imageUrl: '/inicio_images/muebles_decoracion.jpg',
    title: 'Renueva tu hogar',
    subtitle: 'Muebles y decoración con ofertas únicas.',
    buttonText: 'Ver Detalles',
    buttonLink: '#',
    layout: 'imageRight',
    category: 'Hogar',
  },
  {
    id: 'promo5',
    imageUrl: '/inicio_images/belleza_cuidado.avif',
    title: 'Belleza y cuidado personal',
    subtitle: 'Productos exclusivos para ti.',
    buttonText: 'Ver Detalles',
    buttonLink: '#',
    layout: 'imageRight',
    category: 'Belleza y cuidado personal',
  },
];

function PromotionalBlocks() {
  const navigate = useNavigate();
  const largeBlock = promotionalData.find(b => b.layout === 'large');
  const smallBlocks = promotionalData.filter(b => b.layout !== 'large');

  const handleDetailsClick = (category: string) => {
    const slug = createCategorySlug(category);
    navigate(`/buy?category=${slug}`);
  };

  return (
    <section className="py-0 pt-4 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Large Block */}
          {largeBlock && (
            <div key={largeBlock.id} className="group relative rounded-xl overflow-hidden min-h-[20rem] sm:min-h-[24rem] lg:min-h-[32rem]">
              <img src={largeBlock.imageUrl} alt={largeBlock.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-8 flex flex-col justify-end h-full text-white">
                <h3 className="text-3xl lg:text-4xl font-extrabold mb-2 drop-shadow-lg">{largeBlock.title}</h3>
                <p className="text-lg lg:text-xl mb-4 drop-shadow-lg">{largeBlock.subtitle}</p>
                <Button variant="outline" className="w-fit bg-white border-blue-500 text-blue-500 hover:bg-blue-50" onClick={() => handleDetailsClick(largeBlock.category)}>
                  {largeBlock.buttonText} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Small Blocks Grid */}
          <div className="grid grid-cols-2 gap-6">
            {smallBlocks.map(block => (
              <div key={block.id} className="group relative rounded-xl overflow-hidden min-h-[12rem] sm:min-h-[15rem]">
                <img src={block.imageUrl} alt={block.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10 p-6 flex flex-col justify-center items-center text-center h-full text-white">
                  <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{block.title}</h3>
                  <p className="text-sm mb-3 drop-shadow-md">{block.subtitle}</p>
                  <Button variant="outline" className="bg-white border-blue-500 text-blue-500 hover:bg-blue-50" onClick={() => handleDetailsClick(block.category)}>
                    {block.buttonText}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default PromotionalBlocks;
