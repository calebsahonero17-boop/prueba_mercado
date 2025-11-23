import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Importar supabase

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    navigate(`/producto/${product.id}`);
  };

  return (
    <div 
      className="border border-gray-200 rounded-lg shadow-sm flex flex-col transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl cursor-pointer"
      onClick={handleNavigate}
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
        <img 
          src={product.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'} 
          alt={product.nombre} 
          className="w-full h-48 object-contain object-center" 
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'; }}
        />
      </div>
      <div className="p-2 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-blue-600 uppercase">{product.categoria_nombre || 'Categoría'}</span>
        <h3 className="text-sm text-gray-700 h-10 line-clamp-2">
          {product.nombre}
        </h3>
        <div className="mt-auto">
          <p className="mt-1 text-lg font-bold text-green-600">
            Bs {product.precio}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Evita que el click se propague al div contenedor
              handleNavigate();
            }}
            className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
};


const CategoryProductRow: React.FC<{ categoryName: string, allCategories: any[] }> = ({ categoryName, allCategories }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryId = React.useMemo(() => {
    if (!allCategories || !allCategories.length) return null;
    const category = allCategories.find(cat => cat.nombre.toLowerCase() === categoryName.toLowerCase());
    return category ? category.id : null;
  }, [allCategories, categoryName]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase.rpc('productos_por_categoria_para_inicio', {
        categoria_id_filtro: categoryId
      });

      if (error) {
        console.error('Error detallado para categoría ' + categoryName + ':', JSON.stringify(error, null, 2));
        setProducts([]);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [categoryId, categoryName]);

  // No renderizar nada si la categoría no se encontró o no tiene productos
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-2 md:py-6">
      <div className="container mx-auto px-4">
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{categoryName}</h2>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="w-10 h-10 animate-spin text-blue-600"/>
          </div>
        ) : (
          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-40 md:w-60">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryProductRow;
