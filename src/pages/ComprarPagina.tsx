import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Grid, List, ArrowLeft, Heart, User, Loader, Mic, X, Filter, ChevronDown } from 'lucide-react';
import { Card, Input } from '../components/ui';
import Button from '../components/ui/Button';
import { Product } from '../types/product';
import { useProducts, useCategories } from '../hooks/useProducts';
import { useFavoritos } from '../contexts/FavoritosContext';
import { useDebounce } from '../hooks/useDebounce';



const ProductCard = ({ product, esFavorito, onToggleFavorite, onContact, onNavigate, allCategories }) => {
  const isSold = product.estado === 'vendido';

  // Robust category name lookup with logging
  let categoryName = 'Categoría';
  if (Array.isArray(allCategories) && product.categoria) {
    const foundCategory = allCategories.find(cat => cat.id === product.categoria);
    if (foundCategory) {
      categoryName = foundCategory.nombre;
    } else {
      console.warn(`Category not found for product ID: ${product.id}, category ID: ${product.categoria}`);
    }
  }

  return (
    <div className={`bg-white border border-blue-100 rounded-lg overflow-hidden group transition-shadow duration-300 hover:shadow-xl ${isSold ? 'opacity-60' : ''}`}> {/* Changed border color */}
      <div className="relative">
        <img 
          src={product.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'} 
          alt={product.nombre} 
          className="w-full h-48 object-contain group-hover:scale-105 transition-transform duration-300 cursor-pointer" 
          onClick={() => !isSold && onNavigate(`/producto/${product.id}`)}
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'; }}
        />
        {isSold && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-xl font-bold bg-red-600 px-4 py-2 rounded-md">VENDIDO</span>
          </div>
        )}
        <button onClick={() => onToggleFavorite(product.id)} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white backdrop-blur-sm transition-colors">
          <Heart className={`w-5 h-5 ${esFavorito(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
        {product.stock != null && product.stock <= 5 && product.stock > 0 && !isSold && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">ÚLTIMAS {product.stock}</div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-semibold text-blue-600 uppercase">{categoryName}</span>
        <h3 className="font-bold text-lg text-gray-800 mt-1 mb-2 line-clamp-2 h-14">{product.nombre}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-extrabold text-blue-700">Bs {product.precio}</span> {/* Changed price color */}
        </div>
        <Button 
          variant="outline" 
          fullWidth 
          onClick={() => onNavigate(`/producto/${product.id}`)} 
          className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          disabled={isSold}
        >
          {isSold ? 'Producto Vendido' : 'Ver detalles'}
        </Button> {/* Changed button style */}
      </div>
    </div>
  );
};

const FiltersSidebar = ({ categorias, categoriaSeleccionada, onCategoriaSelect, rangoPrecio, setRangoPrecio, limpiarFiltros, isOpen, setIsOpen }) => {
  // Helper para construir opciones de categoría jerárquicas para el sidebar
  const renderCategoryList = (
    allCategories: Category[],
    parentId: string | null = null,
    depth = 0
  ) => {
    return allCategories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map(cat => (
        <React.Fragment key={cat.id}>
          <li>
            <button
              onClick={() => { onCategoriaSelect(cat.slug); setIsOpen(false); }}
              className={`w-full text-left text-sm ${categoriaSeleccionada === cat.id ? 'font-bold text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              style={{ paddingLeft: `${10 + depth * 15}px` }}
            >
              {depth > 0 ? '— ' : ''}{cat.nombre}
            </button>
          </li>
          {renderCategoryList(allCategories, cat.id, depth + 1)}
        </React.Fragment>
      ));
  };

  const content = (
    <div className="bg-gray-50 rounded-xl p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-700 flex items-center"><Filter className="w-5 h-5 mr-2 text-blue-500"/>Filtros</h2>
        <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 rounded-full hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="font-semibold text-blue-600 mb-3">Categorías</h3>
        <ul className="space-y-2">
          <li>
            <button onClick={() => { onCategoriaSelect(null); setIsOpen(false); }} className={`w-full text-left text-sm ${!categoriaSeleccionada ? 'font-bold text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>Todas</button>
          </li>
          {renderCategoryList(categorias)}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-blue-600 mb-3">Precio (Bs)</h3>
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="Mín" value={rangoPrecio[0] || ''} onChange={(e) => setRangoPrecio([+e.target.value, rangoPrecio[1]])} />
          <span className="text-gray-400">-</span>
          <Input type="number" placeholder="Máx" value={rangoPrecio[1] === 10000 ? '' : rangoPrecio[1] || ''} onChange={(e) => setRangoPrecio([rangoPrecio[0], +e.target.value || 10000])} />
        </div>
      </div>

      <Button variant="outline" fullWidth onClick={limpiarFiltros} icon={X} className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">Limpiar Filtros</Button>
    </div>
  );

  return (
    <>
      {/* Mobile view: fixed overlay */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-[10001] lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`fixed top-0 left-0 w-80 h-full bg-white z-[10002] transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}>
        {content}
      </aside>

      {/* Desktop view: sticky sidebar */}
      <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 self-start">
        {content}
      </aside>
    </>
  );
};




function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ComprarPagina() {
  const navigate = useNavigate();
  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritos();
  const query = useQuery();
  const categorySlugFromQuery = query.get('category');
  const searchQueryFromQuery = query.get('search');
  const { categories, loading: cargandoCategorias } = useCategories();
  
  const filteredCategories = categories.filter(cat => 
    cat.nombre !== "Adopciones o venta de animales (según políticas locales de Facebook)"
  );
  
  const [textoBusqueda, setTextoBusqueda] = useState(searchQueryFromQuery || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([0, 10000]);
  const [ordenarPor, setOrdenarPor] = useState('relevancia');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    if (searchQueryFromQuery) {
      setTextoBusqueda(searchQueryFromQuery);
    }
  }, [searchQueryFromQuery]);
  
  useEffect(() => {
    if (categorySlugFromQuery && categories.length > 0) {
      const targetCategory = categories.find(cat => 
        cat.slug && cat.slug.trim().toLowerCase() === categorySlugFromQuery.trim().toLowerCase()
      );
      if (targetCategory) {
        setCategoriaSeleccionada(targetCategory.id);
      } else {
        setCategoriaSeleccionada('');
      }
    } else {
      setCategoriaSeleccionada('');
    }
  }, [categorySlugFromQuery, categories]);

  const textoBusquedaDebounced = useDebounce(textoBusqueda, 500);

  const { products, loading, loadingMore, hasMore, error, loadMore } = useProducts({ textoBusqueda: textoBusquedaDebounced, categoriaId: categoriaSeleccionada || undefined, precioMin: rangoPrecio[0], precioMax: rangoPrecio[1] === 10000 ? undefined : rangoPrecio[1], ordenarPor });

  const toggleFavorite = (productId: string) => {
    esFavorito(productId) ? quitarFavorito(productId) : agregarFavorito(productId);
  };

  const handleCategoriaChange = (slug: string | null) => {
    if (slug) {
      navigate(`/comprar?category=${slug}`);
    } else {
      navigate('/comprar');
    }
  };

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    handleCategoriaChange(null);
    setRangoPrecio([0, 10000]);
    setOrdenarPor('relevancia');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">Explorar Productos</h1>
            <p className="text-lg text-gray-700 mt-1">Descubre productos únicos y apoya a la comunidad boliviana.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <FiltersSidebar 
            categorias={cargandoCategorias ? [] : filteredCategories} 
            categoriaSeleccionada={categoriaSeleccionada} 
            onCategoriaSelect={handleCategoriaChange} 
            rangoPrecio={rangoPrecio} 
            setRangoPrecio={setRangoPrecio} 
            limpiarFiltros={limpiarFiltros}
            isOpen={isFiltersOpen}
            setIsOpen={setIsFiltersOpen}
          />

          <main className="col-span-1 lg:col-span-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 p-4 bg-white border border-blue-200 rounded-xl shadow-sm sticky top-4 z-10">
              <div className="w-full sm:w-auto flex-grow">
                <Input type="text" placeholder="Buscar en miles de productos..." value={textoBusqueda} onChange={(e) => setTextoBusqueda(e.target.value)} icon={Search} className="focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="w-full sm:w-auto sm:flex-shrink-0">
                <Button variant="outline" onClick={() => setIsFiltersOpen(true)} className="lg:hidden w-full">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                </Button>
              </div>
              <div className="w-full sm:w-auto sm:flex-shrink-0">
                <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="relevancia">Relevancia</option>
                  <option value="fecha_desc">Más nuevos</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>

            {loading && <div className="flex justify-center py-20"><Loader className="w-10 h-10 animate-spin text-blue-600"/></div>}
            
            {!loading && products.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No se encontraron productos</h3>
                <p className="text-gray-600 mb-4">Intenta ajustar tus filtros o buscar con otras palabras.</p>
                <Button variant="outline" onClick={limpiarFiltros}>Limpiar todos los filtros</Button>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} esFavorito={esFavorito} onToggleFavorite={toggleFavorite} onContact={() => {}} onNavigate={navigate} allCategories={filteredCategories} />)}
              </div>
            )}

            <div className="mt-12 text-center">
              {loadingMore && <div className="flex justify-center py-4"><Loader className="w-8 h-8 animate-spin text-blue-600"/></div>}
              {hasMore && !loadingMore && !loading && <Button variant="primary" onClick={loadMore}>Cargar más productos</Button>}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ComprarPagina;