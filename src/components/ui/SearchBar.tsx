import React, { useState, useEffect } from 'react';
import { Search, Menu, ChevronDown, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCategories, useProducts } from '../../hooks/useProducts'; // Importar el hook
import { useDebounce } from '../../hooks/useDebounce';

// Tipos para claridad
interface Category {
  id: string;
  nombre: string;
  slug: string;
  parent_id: string | null;
}

interface CategorySection {
  title: string;
  links: { to: string; label: string; slug: string; }[];
}

interface SearchBarProps {
  isAuthenticated: boolean;
  esVendedor: boolean;
  handleLogout: () => void;
  user: any;
}

const SearchBar = ({ isAuthenticated, esVendedor, handleLogout, user }: SearchBarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { products: searchResults, loading: loadingSearchResults } = useProducts({ textoBusqueda: searchQuery, disablePagination: true });
  const navigate = useNavigate();
  
  // 1. Obtener categorías dinámicamente
  const { categories, loading: loadingCategories } = useCategories();
  const [dynamicSections, setDynamicSections] = useState<CategorySection[]>([]);

  // 2. Procesar categorías en secciones cuando se cargan
  useEffect(() => {
    if (categories && categories.length > 0) {
      const parentCategories = categories.filter(cat => cat.parent_id === null);
      let sections = parentCategories.map(parent => {
        const childLinks = categories
          .filter(child => child.parent_id === parent.id)
          .map(child => ({
            to: `/comprar?category=${child.slug}`,
            label: child.nombre,
            slug: child.slug,
          }));
        return {
          title: parent.nombre,
          links: childLinks,
        };
      });

      console.log('Sections before reorder:', sections.map(s => s.title));

      // Reorder logic to move "Vehículos" next to "Hobbies"
      const vehiculosIndex = sections.findIndex(section => section.title === 'Vehículos');
      const hobbiesIndex = sections.findIndex(section => section.title === 'Hobbies');

      if (vehiculosIndex !== -1 && hobbiesIndex !== -1) {
        const vehiculosSection = sections.splice(vehiculosIndex, 1)[0]; // Remove Vehículos
        // Adjust hobbiesIndex if it was after the removed item
        const newHobbiesIndex = sections.findIndex(section => section.title === 'Hobbies');
        sections.splice(newHobbiesIndex + 1, 0, vehiculosSection); // Insert after Hobbies
      }
      console.log('Sections after reorder:', sections.map(s => s.title));

      setDynamicSections(sections);
    }
  }, [categories]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/buy?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const CategoryLink = ({ to, label }: { to: string, label: string }) => (
    <Link
      to={to}
      onClick={(e) => {
        e.preventDefault();
        handleNavigation(to);
      }}
      className="block px-1 py-0.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
    >
      {label}
    </Link>
  );
  
  const menuItems = [
    { path: '/', label: 'Inicio' },
    { path: '/vender', label: 'Vender' },
    { path: '/comprar', label: 'Comprar' },
    { path: '/preguntas-frecuentes', label: 'Preguntas' },
    { path: '/quienes-somos', label: 'Sobre Nosotros' },
    { path: '/contacto', label: 'Contacto' },
  ];

  return (
    <div id="search-bar-container" className="w-full relative">
      <div className="flex items-center border-2 border-gray-300 rounded-full shadow-sm overflow-hidden">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-4 py-2.5 md:py-3 text-gray-600 hover:bg-gray-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <input
          type="text"
          placeholder="Buscar productos..."
          className="w-full px-2 py-2.5 md:py-3 text-sm md:text-lg text-gray-700 focus:outline-none"
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        )}
        <button onClick={handleSearch} className="px-4 py-2.5 md:py-3 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {searchQuery && (
        <div id="search-results-dropdown" className="absolute mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-[9998] max-h-96 overflow-y-auto">
          {loadingSearchResults && <div className="p-4 text-center">Buscando...</div>}
          {!loadingSearchResults && searchResults.length === 0 && (
            <div className="p-4 text-center">No se encontraron resultados.</div>
          )}
          {!loadingSearchResults && searchResults.length > 0 && (
            <ul>
              {searchResults.map(product => (
                <li key={product.id} className="border-b last:border-b-0">
                  <Link 
                    to={`/producto/${product.id}`} 
                    className="flex items-center p-2 hover:bg-gray-100"
                    onClick={() => setSearchQuery('')}
                  >
                    <img src={product.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'} alt={product.nombre} className="w-12 h-12 object-contain mr-4" />
                    <div className="flex-1">
                      <p className="font-semibold">{product.nombre}</p>
                      <p className="text-sm text-gray-600">Bs {product.precio}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {isDropdownOpen && (
        <div className="absolute mt-2 md:mt-0 inset-x-0 md:left-1/2 md:-translate-x-1/2 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] p-4 w-full max-w-md md:max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-x-4 md:gap-y-6">
            
            {/* --- Mi cuenta --- */}
            <div>
                <h3
                  className="font-semibold text-gray-700 mb-2 flex justify-between items-center cursor-pointer md:cursor-default md:text-sm"
                  onClick={() => setOpenCategory(openCategory === 'Mi cuenta' ? null : 'Mi cuenta')}
                >
                  Mi cuenta
                  <ChevronDown className={`w-4 h-4 md:hidden transform transition-transform ${openCategory === 'Mi cuenta' ? 'rotate-180' : ''}`} />
                </h3>
                <ul className={`space-y-1 pl-2 border-l md:pl-0 md:border-l-0 ${openCategory === 'Mi cuenta' ? 'block' : 'hidden'} md:block`}>
                {isAuthenticated ? (
                  <>
                    <li><CategoryLink to="/perfil" label="Mi Perfil" /></li>
                    {esVendedor && (
                      <li><CategoryLink to="/mis-productos" label="Mis Productos" /></li>
                    )}
                    <li><CategoryLink to="/mis-pedidos" label="Mis Pedidos" /></li>
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="block px-1 py-0.5 text-xs md:text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                      >
                        Salir
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li><CategoryLink to="/iniciar-sesion" label="Iniciar Sesión" /></li>
                    <li><CategoryLink to="/registro" label="Registrarse" /></li>
                  </>
                )}
              </ul>
            </div>

            {/* --- Columna de Navegación --- */}
            <div>
              <h3 
                className="font-semibold text-gray-700 mb-2 flex justify-between items-center cursor-pointer md:cursor-default md:text-sm"
                onClick={() => setOpenCategory(openCategory === 'Navegación' ? null : 'Navegación')}
              >
                Navegación
                <ChevronDown className={`w-4 h-4 md:hidden transform transition-transform ${openCategory === 'Navegación' ? 'rotate-180' : ''}`} />
              </h3>
              <ul className={`space-y-1 pl-2 border-l md:pl-0 md:border-l-0 ${openCategory === 'Navegación' ? 'block' : 'hidden'} md:block`}>
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <CategoryLink to={item.path} label={item.label} />
                  </li>
                ))}
              </ul>
            </div>

            {/* --- Columnas de Categorías Dinámicas --- */}
            {loadingCategories ? (
              <p>Cargando categorías...</p>
            ) : (
              dynamicSections.map((section) => (
                <div key={section.title}>
                  <h3
                    className="font-semibold text-gray-700 mb-2 md:mb-1 flex justify-between items-center cursor-pointer md:cursor-default md:text-sm"
                    onClick={() => setOpenCategory(openCategory === section.title ? null : section.title)}
                  >
                    {section.title}
                    <ChevronDown className={`w-4 h-4 md:hidden transform transition-transform ${openCategory === section.title ? 'rotate-180' : ''}`} />
                  </h3>
                  <ul className={`space-y-1 pl-2 border-l md:pl-0 md:border-l-0 ${openCategory === section.title ? 'block' : 'hidden'} md:block`}>
                    {section.links.map((link) => (
                      <li key={link.to}>
                        <CategoryLink to={link.to} label={link.label} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;