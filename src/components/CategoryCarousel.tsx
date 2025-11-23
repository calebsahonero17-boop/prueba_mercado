import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CategoryCarousel.module.css';
import { useCategories } from '../hooks/useProducts';

const CategoryCarousel: React.FC = () => {
  const { categories, loading } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        // Si hay un movimiento vertical en la rueda del ratón
        if (e.deltaY !== 0) {
          // Prevenir el scroll vertical de la página
          e.preventDefault();
          // Aplicar ese movimiento al scroll horizontal del contenedor
          container.scrollLeft += e.deltaY;
        }
      };

      container.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  const parentCategories = React.useMemo(() => {
    if (loading || !categories) return [];
    return categories.filter(cat => cat.parent_id === null);
  }, [categories, loading]);

  const categoryImages = {
    'Bebés y niños': '/inicio_images/bebes.jpg',
    'Deportes y actividades al aire libre': '/inicio_images/deporte_categoria.jpg',
    'Electrónica': '/inicio_images/tegnologia.jpeg',
    'Hobbies y coleccionismo': '/inicio_images/descubre-una-asombrosa-colección-de-antigüedades-época-objetos-diseñados-forma-exquisita-para-tu-decoración-residencial-383889470.webp',
    'Hogar y jardín': '/inicio_images/hogar.jpeg',
    'Libros, música y entretenimiento': '/inicio_images/auriculares_bluetoh.jpg',
    'Mascotas': '/inicio_images/masco.jpg',
    'Oficina y negocios': '/inicio_images/laptop.jpg',
    'Propiedades': '/inicio_images/muebles_decoracion.jpg',
    'Ropa y accesorios': '/inicio_images/moda.jpeg',
    'Vehículos': '/inicio_images/automotriz.avif',
  };

  if (loading) {
    return <div className="py-4 bg-gray-100 px-4 text-center">Cargando categorías...</div>;
  }

  return (
    <div className="py-4 bg-gray-100 px-4">
      <div ref={scrollContainerRef} className={`flex flex-nowrap space-x-2 overflow-x-auto ${styles.hideScrollbar}`}>
        {parentCategories.map((category, index) => (
          <Link to={`/comprar?category=${category.slug}`} key={index} className="flex-shrink-0">
            <div
              className="flex flex-col items-center w-32 md:w-48"
            >
              <img src={categoryImages[category.nombre] || '/inicio_images/default.jpg'} alt={category.nombre} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full shadow-md" />
              <p className="mt-2 text-center font-semibold text-gray-800">{category.nombre}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
