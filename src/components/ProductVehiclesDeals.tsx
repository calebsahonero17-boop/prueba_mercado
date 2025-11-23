import React from 'react';
import { ArrowRight, Heart } from 'lucide-react';
import { Card, Button } from './ui';
import { useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import { Product, Category } from '../types/product';

function ProductVehiclesDeals() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const targetCategory = categories.find(cat => cat.nombre === 'Vehículos');
  const { products, loading, error } = useProducts({ categoriaId: targetCategory?.id });

  const handleDetailsClick = (categoryId: string, categorySlug: string) => {
    navigate(`/buy?category=${categorySlug}`);
  };

  if (loading) return <div className="text-center py-8">Cargando ofertas de Vehículos...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error al cargar ofertas de Vehículos.</div>;
  if (!products || products.length === 0) return null; // Don't render if no products

  return (
    <section className="py-8 bg-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ofertas en Vehículos
          </h2>
          <Button variant="link" className="text-blue-600 hover:text-blue-800 font-semibold" onClick={() => handleDetailsClick(targetCategory?.id || '', targetCategory?.slug || '')}>
            Ver todo <ArrowRight className="ml-1 w-5 h-5" />
          </Button>
        </div>

        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-6 lg:space-x-0 lg:overflow-x-hidden">
          {products.map((product) => (
            <Card key={product.id} className="flex-none w-64 lg:w-auto group relative flex flex-col overflow-hidden rounded-lg border bg-white transition-shadow duration-300 hover:shadow-xl">
              <div className="relative aspect-square w-full overflow-hidden">
                <img src={product.url_imagen || '/placeholder.png'} alt={product.nombre} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                {/* Assuming product.badge is not directly from DB, or needs mapping */}
                {/* {product.badge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {product.badge}
                  </span>
                )} */}
                <button className="absolute top-3 right-3 z-10 rounded-full bg-white/70 p-1.5 text-gray-500 backdrop-blur-sm transition-colors hover:text-red-500">
                  <Heart size={20} fill={product.isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="text-xs font-semibold text-blue-600 uppercase mb-1">{product.categoria_nombre || 'Categoría'}</span>
                <h3 className="text-sm font-semibold text-gray-800 mb-1.5 line-clamp-2">{product.nombre}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">Bs. {product.precio.toFixed(2)}</span>
                  {/* Assuming oldPrice is not directly from DB */}
                  {/* {product.oldPrice && (
                    <span className="text-sm text-gray-500 line-through">{product.oldPrice}</span>
                  )} */}
                </div>
                <Button variant="outline" className="mt-auto w-full rounded-lg border-blue-500 text-blue-500 hover:bg-blue-50" onClick={() => navigate(`/producto/${product.id}`)}>
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

export default ProductVehiclesDeals;