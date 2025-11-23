import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface OpcionesBusquedaProductos {
  categoriaId?: string; // Cambiado a ID de categoría (UUID)
  precioMin?: number;
  precioMax?: number;
  textoBusqueda?: string;
  vendedorId?: string;
  ordenarPor?: string;
  disablePagination?: boolean; // Nueva opción para deshabilitar la paginación
}

const TAMANO_PAGINA = 20; // Cargar productos en lotes de 20

// Columnas a seleccionar (la función RPC ya devuelve todas las columnas del tipo 'productos')

export function useProducts(options: OpcionesBusquedaProductos = {}) {
  const [productos, setProductos] = useState<Product[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [hayMas, setHayMas] = useState(true);
  const { user, loading: authLoading } = useSupabaseAuth();

  const esModoDemo = user?.id === 'demo-user' ||
                   (user?.nombres === 'Usuario' && user?.apellidos === 'Demo');

  const buscarProductos = useCallback(async (esCargaInicial: boolean) => {
    if (options.disablePagination) { // Si la paginación está deshabilitada, siempre es carga inicial
      esCargaInicial = true;
    }

    if (esCargaInicial) {
      setCargando(true);
      setPagina(0);
      setHayMas(true);
    } else {
      setCargandoMas(true);
    }
    setError(null);

    try {
      // La lógica de modo demo se puede mantener o adaptar si es necesario
      if (esModoDemo && !options.vendedorId) {
        console.log('🧪 Modo demo: Usando productos locales');
        await new Promise(resolve => setTimeout(resolve, 500));
        setProductos(PRODUCTOS_DEMO);
        setHayMas(false);
        return;
      }

      console.log(`📦 Llamando a RPC 'buscar_productos' con opciones:`, options);

      // Mapeo de opciones del hook a los parámetros de la función RPC
      const parametrosRPC = {
        texto_busqueda: options.textoBusqueda,
        categoria_id_filtro: options.categoriaId, // Cambiado a ID de categoría
        precio_min_filtro: options.precioMin,
        precio_max_filtro: options.precioMax,
        ordenar_por: options.ordenarPor || 'relevancia',
        vendedor_id_filtro: options.vendedorId
      };

      let query = supabase.rpc('buscar_productos', parametrosRPC);

      // Aplicar paginación solo si no está deshabilitada
      if (!options.disablePagination) {
        const desde = (esCargaInicial ? 0 : pagina) * TAMANO_PAGINA;
        const hasta = desde + TAMANO_PAGINA - 1;
        query = query.range(desde, hasta);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log(`✅ ${data?.length || 0} productos cargados exitosamente`);

      if (esCargaInicial) {
        setProductos(data || []);
      } else {
        setProductos(productosAnteriores => {
          const nuevosProductos = (data || []).filter(
            nuevoProd => !productosAnteriores.some(existenteProd => existenteProd.id === nuevoProd.id)
          );
          return [...productosAnteriores, ...nuevosProductos];
        });
      }

      if (!data || data.length < TAMANO_PAGINA || options.disablePagination) { // Si la paginación está deshabilitada, asumimos que no hay más
        setHayMas(false);
      }

      if (esCargaInicial && !options.disablePagination) {
        setPagina(1);
      }

    } catch (err: any) {
      console.error('❌ Error detallado:', JSON.stringify(err, null, 2));
      const mensajeError = err.message || 'Ocurrió un error desconocido.';
      setError(`No se pudieron cargar los productos: ${mensajeError}`);
      setHayMas(false);
    } finally {
      if (esCargaInicial) {
        setCargando(false);
      } else {
        setCargandoMas(false);
      }
      console.log('✅ Carga de productos finalizada');
    }
  }, [options.categoriaId, options.precioMin, options.precioMax, options.textoBusqueda, options.vendedorId, options.ordenarPor, options.disablePagination, esModoDemo, pagina]);

  // Efecto para la carga inicial y cuando cambian los filtros
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Esperando a que termine la autenticación...');
      return; // No hacer nada hasta que la autenticación esté lista
    }
    buscarProductos(true); // Carga inicial
  }, [authLoading, options.categoriaId, options.precioMin, options.precioMax, options.textoBusqueda, options.vendedorId, options.ordenarPor, options.disablePagination, esModoDemo]);

  const cargarMas = () => {
    if (!cargando && !cargandoMas && hayMas) {
      setPagina(paginaAnterior => {
        const siguientePagina = paginaAnterior + 1;
        buscarProductos(false); // No es carga inicial
        return siguientePagina;
      });
    }
  };
  
  const refetch = () => {
      buscarProductos(true);
  };

  return {
    products: productos,
    loading: cargando,
    loadingMore: cargandoMas,
    error,
    hasMore: hayMas,
    loadMore: cargarMas,
    refetch,
  };
}


// Hook para obtener categorías únicas (sin cambios, pero se mantiene por completitud)
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSupabaseAuth();

  const isDemoMode = user?.id === 'demo-user' ||
                    (user?.nombres === 'Usuario' && user?.apellidos === 'Demo');



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        let fetchedCategories: Category[] = []; // Changed type

        if (isDemoMode) {
          // For demo mode, we need to create Category objects from PRODUCTOS_DEMO
          fetchedCategories = [...new Set(PRODUCTOS_DEMO.map(p => p.categoria))]
            .map(catName => ({ id: catName, nombre: catName, slug: catName.toLowerCase().replace(/ /g, '-'), parent_id: null })); // Simplified for demo
        } else {
          const { data, error } = await supabase
            .from('categorias') // Query the new categories table
            .select('id, nombre, slug, parent_id') // Select all fields for Category interface
            .order('nombre', { ascending: true }); // Order alphabetically

          if (error) throw error;
          fetchedCategories = data || []; // Data already matches Category[]
        }

        // No merging with desiredCategories needed anymore, as it's removed
        setCategories(fetchedCategories.filter(cat => cat.nombre !== 'Adopciones o venta de animales (según políticas locales de Facebook)'));

      } catch (err: any) {
        console.error('❌ Error cargando categorías:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isDemoMode]);

  return {
    categories,
    loading
  };
}

// Datos demo para fallback, etc.
const PRODUCTOS_DEMO: Product[] = [
  {
    id: '1',
    nombre: 'Laptop Dell Inspiron',
    descripcion: 'Laptop Dell Inspiron 15 3000 con procesador Intel Core i5, 8GB RAM, 256GB SSD',
    precio: 4500.00,
    categoria: 'Tecnología',
    stock: 10,
    url_imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    fecha_creacion: '2024-01-15T10:00:00Z',
    fecha_actualizacion: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    nombre: 'iPhone 13',
    descripcion: 'Apple iPhone 13 128GB disponible en varios colores. Cámara dual de 12MP',
    precio: 6800.00,
    categoria: 'Tecnología',
    stock: 5,
    url_imagen: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
    fecha_creacion: '2024-01-14T10:00:00Z',
    fecha_actualizacion: '2024-01-14T10:00:00Z'
  },
  {
    id: '3',
    nombre: 'Camiseta Deportiva',
    descripcion: 'Camiseta de algodón para deportes, varios colores.',
    precio: 120.00,
    categoria: 'Ropa',
    stock: 50,
    url_imagen: 'https://images.unsplash.com/photo-1579582294755-fa91e987477e?w=400',
    fecha_creacion: '2024-01-13T10:00:00Z',
    fecha_actualizacion: '2024-01-13T10:00:00Z'
  },
  {
    id: '4',
    nombre: 'Juego de Sábanas',
    descripcion: 'Juego de sábanas de algodón egipcio, tamaño queen.',
    precio: 300.00,
    categoria: 'Hogar',
    stock: 20,
    url_imagen: 'https://images.unsplash.com/photo-1582169296196-be0f39f2ad8a?w=400',
    fecha_creacion: '2024-01-12T10:00:00Z',
    fecha_actualizacion: '2024-01-12T10:00:00Z'
  },
  {
    id: '5',
    nombre: 'Balón de Fútbol',
    descripcion: 'Balón de fútbol profesional, talla 5.',
    precio: 80.00,
    categoria: 'Deportes',
    stock: 30,
    url_imagen: 'https://images.unsplash.com/photo-1553778263-73a83405662e?w=400',
    fecha_creacion: '2024-01-11T10:00:00Z',
    fecha_actualizacion: '2024-01-11T10:00:00Z'
  },
  {
    id: '6',
    nombre: 'Neumático para Coche',
    descripcion: 'Neumático de alta calidad para todo tipo de clima.',
    precio: 800.00,
    categoria: 'Automotriz',
    stock: 40,
    url_imagen: '/inicio_images/automotriz.avif',
    fecha_creacion: '2024-01-10T10:00:00Z',
    fecha_actualizacion: '2024-01-10T10:00:00Z'
  },
  {
    id: '7',
    nombre: 'Mesa de Jardín',
    descripcion: 'Mesa de jardín de madera con 4 sillas.',
    precio: 700.00,
    categoria: 'Patio y Jardín',
    stock: 10,
    url_imagen: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    fecha_creacion: '2024-01-09T10:00:00Z',
    fecha_actualizacion: '2024-01-09T10:00:00Z'
  },
  {
    id: '8',
    nombre: 'Vestido de Verano',
    descripcion: 'Vestido floral de verano para mujer.',
    precio: 250.00,
    categoria: 'Moda',
    stock: 40,
    url_imagen: 'https://images.unsplash.com/photo-1581044777550-4cfa607037dc?w=400',
    fecha_creacion: '2024-01-08T10:00:00Z',
    fecha_actualizacion: '2024-01-08T10:00:00Z'
  },
  {
    id: '9',
    nombre: 'Coche de Bebé',
    descripcion: 'Coche de bebé ligero y plegable.',
    precio: 400.00,
    categoria: 'Bebé',
    stock: 15,
    url_imagen: 'https://images.unsplash.com/photo-1587620962725-abab7ebfd84c?w=400',
    fecha_creacion: '2024-01-07T10:00:00Z',
    fecha_actualizacion: '2024-01-07T10:00:00Z'
  },
  {
    id: '10',
    nombre: 'Set de Bloques',
    descripcion: 'Set de bloques de construcción para niños.',
    precio: 100.00,
    categoria: 'Juguetes',
    stock: 60,
    url_imagen: 'https://images.unsplash.com/photo-1534620563098-f62107a17b5a?w=400',
    fecha_creacion: '2024-01-06T10:00:00Z',
    fecha_actualizacion: '2024-01-06T10:00:00Z'
  },
  {
    id: '11',
    nombre: 'Crema Hidratante',
    descripcion: 'Crema hidratante facial con ácido hialurónico.',
    precio: 50.00,
    categoria: 'Cuidado Personal',
    stock: 80,
    url_imagen: 'https://images.unsplash.com/photo-1556227834-31323859f88b?w=400',
    fecha_creacion: '2024-01-05T10:00:00Z',
    fecha_actualizacion: '2024-01-05T10:00:00Z'
  },
  {
    id: '12',
    nombre: 'Set de Maquillaje',
    descripcion: 'Set completo de maquillaje profesional.',
    precio: 150.00,
    categoria: 'Belleza',
    stock: 35,
    url_imagen: 'https://images.unsplash.com/photo-1512496015851-a908604f1786?w=400',
    fecha_creacion: '2024-01-04T10:00:00Z',
    fecha_actualizacion: '2024-01-04T10:00:00Z'
  },
  {
    id: '13',
    nombre: 'Kit de Bienestar Esencial',
    descripcion: 'Set completo para el cuidado personal y bienestar.',
    precio: 180.00,
    categoria: 'Salud y bienestar',
    stock: 25,
    url_imagen: 'https://images.unsplash.com/photo-1590439471363-f9256569175e?w=400',
    fecha_creacion: '2024-01-03T10:00:00Z',
    fecha_actualizacion: '2024-01-03T10:00:00Z'
  },
];