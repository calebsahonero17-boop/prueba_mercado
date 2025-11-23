import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Category {
  name: string;
  imageUrl: string;
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

const categories: Category[] = [
  { name: 'Automotriz', imageUrl: '/inicio_images/automotriz.avif' },
  { name: 'Hogar', imageUrl: '/inicio_images/hogar.jpeg' },
  { name: 'Patio y Jardín', imageUrl: '/inicio_images/patio_jardin.jpeg' },
  { name: 'Moda', imageUrl: '/inicio_images/moda.jpeg' },
  { name: 'Tecnología', imageUrl: '/inicio_images/tegnologia.jpeg' },
  { name: 'Bebé', imageUrl: '/inicio_images/bebe.jpg' },
  { name: 'Juguetes', imageUrl: '/inicio_images/juguetes.png' },
  { name: 'Salud y bienestar', imageUrl: '/inicio_images/salub.jpg' },
  { name: 'Cuidado Personal', imageUrl: '/inicio_images/cuidado_personal.jpg' },
  { name: 'Belleza', imageUrl: '/inicio_images/belleza.jpeg' },
  { name: 'Deporte', imageUrl: '/inicio_images/deporte_categoria.jpg' },
];

function CategoryBanner() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    const slug = createCategorySlug(categoryName);
    navigate(`/buy?category=${slug}`);
  };

  return (
    <section className="py-0 sm:py-2 lg:py-4 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
          Consíguelo todo aquí
        </h2>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="text-center w-24 sm:w-28 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="w-28 h-28 mx-auto mb-3 rounded-full overflow-hidden shadow-lg border-4 border-white hover:border-blue-500 transition-all duration-300">
                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm text-gray-800 font-semibold">{category.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryBanner;
