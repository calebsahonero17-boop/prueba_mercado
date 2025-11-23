import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, Upload, AlertCircle, CheckCircle, Users, Package, BarChart3 } from 'lucide-react';
import { Button, Card, Input } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useProducts } from '../hooks/useProducts';
import { usePermisos } from '../hooks/usePermisos';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import AdminStats from '../components/AdminStats';
import GestionUsuarios from '../components/GestionUsuarios';
import GestionPedidos from '../components/GestionPedidos';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AdminSubscriptionRequests from '../components/AdminSubscriptionRequests';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

interface ProductFormData {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  url_imagen: string;
}

function AdministracionPagina({ onNavigate }: AdminPageProps) {
  const toast = useToast();
  const { user, isAuthenticated } = useSupabaseAuth();
  const { products, loading, refetch } = useProducts();
  const { esAdmin, puedeGestionarProductos, puedeEliminarProductos, puedeGestionarUsuarios, puedeGestionarPedidos } = usePermisos(user?.rol);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const [vistaActiva, setVistaActiva] = useState<'productos' | 'usuarios' | 'pedidos' | 'analytics' | 'solicitudes_suscripcion'>('productos');

  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: '',
    stock: 0,
    url_imagen: ''
  });

  const categories = [
    'Textiles', 'Artesanías', 'Alimentos', 'Joyería', 'Cerámica',
    'Instrumentos Musicales', 'Decoración', 'Ropa', 'Accesorios'
  ];

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Requerido</h2>
          <p className="text-gray-600 mb-6">Necesitas iniciar sesión para acceder al panel de administración.</p>
          <Button variant="primary" fullWidth onClick={() => onNavigate('login')}>
            Iniciar Sesión
          </Button>
        </Card>
      </div>
    );
  }

  if (!esAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al panel de administración.</p>
          <Button variant="primary" fullWidth onClick={() => onNavigate('home')}>
            Ir al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  const filteredProducts = products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'precio' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: '',
      stock: 0,
      url_imagen: ''
    });
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleAddProduct = async () => {
    if (!formData.nombre || !formData.descripcion || !formData.categoria) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    console.log('🛍️ Starting add product process...', formData.nombre);
    setSubmitting(true);

    // Auto-reset submitting after 10 seconds to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Add product timeout - forcing stop loading');
      setSubmitting(false);
      toast.error('Timeout al agregar producto. Intenta de nuevo.');
    }, 10000);

    try {
      console.log('✅ Inserting product into database...');
      const { error } = await supabase
        .from('productos')
        .insert([{
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: formData.precio,
          categoria: formData.categoria,
          stock: formData.stock,
          url_imagen: formData.url_imagen || null
        }]);

      if (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }

      console.log('✅ Product added successfully');
      clearTimeout(loadingTimeout);
      toast.success('Producto agregado exitosamente');
      refetch();
      setStatsRefreshTrigger(prev => prev + 1); // Refresh stats
      resetForm();
    } catch (error) {
      console.error('❌ Error adding product:', error);
      clearTimeout(loadingTimeout);
      toast.error('Error al agregar el producto: ' + (error as any).message);
    } finally {
      clearTimeout(loadingTimeout);
      setSubmitting(false);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.nombre || !formData.descripcion || !formData.categoria) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('productos')
        .update({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: formData.precio,
          categoria: formData.categoria,
          stock: formData.stock,
          url_imagen: formData.url_imagen || null,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast.success('Producto actualizado exitosamente');
      refetch();
      setStatsRefreshTrigger(prev => prev + 1); // Refresh stats
      resetForm();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    console.log('🗑️ Starting delete product process...', productId);
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      console.log('✅ Product deleted successfully');
      toast.success('Producto eliminado exitosamente');
      refetch();
      console.log('🔄 Triggering stats refresh...');
      setStatsRefreshTrigger(prev => {
        const newValue = prev + 1;
        console.log('📊 Stats refresh trigger updated:', prev, '->', newValue);
        return newValue;
      });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    }
  };

  const startEditing = (product: Product) => {
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      categoria: product.categoria,
      stock: product.stock,
      url_imagen: product.url_imagen || ''
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className={`mx-auto ${vistaActiva === 'solicitudes_suscripcion' ? 'w-full px-0' : 'max-w-7xl px-4'}`}>
        {/* Header */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('home')}
                className="p-2 text-gray-600 hover:text-blue-700 mr-4 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {
                    vistaActiva === 'productos' ? 'Gestiona productos de Mercado Express' :
                    vistaActiva === 'usuarios' ? 'Gestiona usuarios de Mercado Express' :
                    vistaActiva === 'pedidos' ? 'Gestiona pedidos de Mercado Express' :
                    'Visualiza métricas y analytics de Mercado Express'
                  }
                </p>
              </div>
            </div>
            {vistaActiva === 'productos' && puedeGestionarProductos && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
                className="w-full sm:w-auto"
              >
                Agregar Producto
              </Button>
            )}
          </div>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto flex-nowrap space-x-2 sm:space-x-4 mb-8 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => {
                      setVistaActiva('analytics');
                      setShowAddForm(false);
                      setEditingProduct(null);
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                      vistaActiva === 'analytics'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-white'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      setVistaActiva('productos');
                      setShowAddForm(false);
                      setEditingProduct(null);
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                      vistaActiva === 'productos'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-600 hover:text-blue-700 hover:bg-white'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    Productos
                  </button>
                  {puedeGestionarUsuarios && (
                    <button
                      onClick={() => {
                        setVistaActiva('usuarios');
                        setShowAddForm(false);
                        setEditingProduct(null);
                      }}
                      className={`whitespace-nowrap px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                        vistaActiva === 'usuarios'
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-gray-600 hover:text-blue-700 hover:bg-white'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Usuarios
                    </button>
                  )}
                  {puedeGestionarPedidos && (
                    <button
                      onClick={() => {
                        setVistaActiva('pedidos');
                        setShowAddForm(false);
                        setEditingProduct(null);
                      }}
                      className={`whitespace-nowrap px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                        vistaActiva === 'pedidos'
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-gray-600 hover:text-blue-700 hover:bg-white'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Pedidos
                    </button>
                  )}
                  {esAdmin && ( // Only show this tab to admins
                    <button
                      onClick={() => {
                        setVistaActiva('solicitudes_suscripcion');
                        setShowAddForm(false);
                        setEditingProduct(null);
                      }}
                      className={`whitespace-nowrap px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                        vistaActiva === 'solicitudes_suscripcion'
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-gray-600 hover:text-blue-700 hover:bg-white'
                      }`}
                    >
                      <Users className="w-4 h-4" /> {/* Using Users icon for now, can change later */}
                      Solicitudes Suscripción
                    </button>
                  )}
                </div>
        {/* Analytics Dashboard */}
        {vistaActiva === 'analytics' && <AnalyticsDashboard refreshTrigger={statsRefreshTrigger} />}

        {/* Statistics Dashboard */}
        {vistaActiva === 'productos' && <AdminStats refreshTrigger={statsRefreshTrigger} />}

        {/* Vista de Usuarios */}
        {vistaActiva === 'usuarios' && (
          <GestionUsuarios actualizacionTrigger={statsRefreshTrigger} />
        )}

        {/* Vista de Pedidos */}
        {vistaActiva === 'pedidos' && (
          <GestionPedidos actualizacionTrigger={statsRefreshTrigger} />
        )}

        {/* Vista de Solicitudes de Suscripción */}
        {vistaActiva === 'solicitudes_suscripcion' && (
          <AdminSubscriptionRequests />
        )}

        {/* Add/Edit Product Form */}
        {vistaActiva === 'productos' && showAddForm && (
          <Card variant="elevated" padding="lg" className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h2>
              <Button variant="outline" icon={X} onClick={resetForm}>
                Cancelar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <Input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Aguayo de La Paz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (Bs) *
                </label>
                <Input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock
                </label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen
                </label>
                <Input
                  type="url"
                  name="url_imagen"
                  value={formData.url_imagen}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe el producto detalladamente..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                icon={Save}
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Agregar')} Producto
              </Button>

              {submitting ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitting(false);
                    toast.info('Operación cancelada');
                  }}
                >
                  Forzar parada
                </Button>
              ) : (
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Search */}
        {vistaActiva === 'productos' && (
          <Card variant="elevated" padding="md" className="mb-6">
            <Input
              type="text"
              placeholder="Buscar productos por nombre o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </Card>
        )}

        {/* Products Table */}
        {vistaActiva === 'productos' && (
          <Card variant="elevated" padding="none" className="overflow-hidden">
          <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Productos ({filteredProducts.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No se encontraron productos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.url_imagen || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100'}
                            alt={product.nombre}
                            className="w-10 h-10 rounded-lg object-cover mr-4"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100';
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.nombre}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.descripcion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {product.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Bs {product.precio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(product)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          disabled={!puedeEliminarProductos}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        </Card>
        )}
      </div>
    </div>
  );
}

export default AdministracionPagina;