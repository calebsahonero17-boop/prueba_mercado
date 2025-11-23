import React, { useState, useEffect, useRef } from 'react';
import { Upload, Users, TrendingUp, ArrowLeft, Camera, Tag, MapPin, Shield, LogIn, UserPlus, X, Plus, Loader, Edit, Crown, FileText, Package, CheckSquare, List } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // Importar useNavigate
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, Card } from '../components/ui';
import { subirImagenes } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui/Spinner';
import { useCategories } from '../hooks/useProducts';
import { Product, Category } from '../types/product';

// --- Definición de Límites por Plan ---
const PLAN_LIMITS = {
  'Vendedor Básico': 3,
  'Vendedor Premium': 7,
};

// --- Componente para mostrar cuando se alcanza el límite ---
const LimitReachedComponent = ({ onNavigate, userPlan, productCount, limit }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
      <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Límite de Productos Alcanzado</h2>
      <p className="text-gray-600 mb-6">
        Has publicado {productCount} de {limit} productos permitidos en tu Plan <span className="font-bold capitalize">{userPlan}</span>.
      </p>
      {userPlan !== 'Vendedor Premium' && (
        <p className="text-gray-600 mb-6">¡Actualiza a Premium para publicar más productos y acceder a más beneficios!</p>
      )}
      {userPlan === 'Vendedor Premium' && (
        <p className="text-gray-600 mb-6">Has alcanzado el límite máximo de productos para tu plan actual.</p>
      )}

      {userPlan !== 'Vendedor Premium' && (
        <Button variant="primary" fullWidth icon={Crown} onClick={() => onNavigate('suscripcion')}>
          Mejorar a Premium
        </Button>
      )}
      {userPlan === 'Vendedor Premium' && (
        <Button variant="outline" fullWidth icon={Crown} onClick={() => onNavigate('suscripcion')}>
          Gestionar mi Plan
        </Button>
      )}
    </Card>
  </div>
);

function VenderPagina() { // Se elimina onNavigate de las props
  const { isAuthenticated, user } = useSupabaseAuth();
  const toast = useToast();
  const { categories, loading: loadingCategories } = useCategories();
  const navigate = useNavigate(); // Usar el hook de navegación
  const { productId } = useParams();
  const [isEditMode, setIsEditMode] = useState(!!productId);

  // Helper para construir opciones de categoría jerárquicas
  const renderCategoryOptions = (
    allCategories: Category[],
    parentId: string | null = null,
    depth = 0
  ) => {
    return allCategories
      .filter(cat => cat.parent_id === parentId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Sort by name
      .flatMap(cat => [
        <option key={cat.id} value={cat.id} style={{ paddingLeft: `${10 + depth * 15}px` }}>
            {depth > 0 ? '— ' : ''}{cat.nombre}
        </option>,
        ...renderCategoryOptions(allCategories, cat.id, depth + 1)
      ]);
  };

  // --- ESTADO PARA LÍMITES DE PRODUCTOS ---
  const [productCount, setProductCount] = useState(0);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [limitReached, setLimitReached] = useState(false);

  // --- Lógica de Hooks y Estado del Formulario ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    stock: '1',
    description: '',
    condition: '',
    location: ''
  });

  // --- EFECTO PARA VERIFICAR EL LÍMITE DE PRODUCTOS ---
  useEffect(() => {
    const checkProductLimit = async () => {
      if (!user || user.rol !== 'vendedor') {
        setLoadingLimit(false);
        return;
      }
      try {
        const { count, error } = await supabase
          .from('productos')
          .select('id', { count: 'exact', head: true })
          .eq('vendedor_id', user.id);
        if (error) throw error;
        console.log("Product count after check:", count); // Temporary debugging line
        const userPlan = user?.plan_suscripcion || 'Vendedor Básico';
        const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.basico;
        setProductCount(count || 0);
        if (count >= limit) {
          setLimitReached(true);
        }
      } catch (err) {
        console.error("Error checking product limit:", err);
        toast.error("Error al verificar el límite de productos.");
      } finally {
        setLoadingLimit(false);
      }
    };
    checkProductLimit();
  }, [user, toast]);

  // --- EFECTO PARA CARGAR DATOS EN MODO EDICIÓN ---
  useEffect(() => {
    if (isEditMode && productId) {
      const fetchProduct = async () => {
        try {
          const { data: productData, error } = await supabase
            .from('productos')
            .select('*')
            .eq('id', productId)
            .single();

          if (error) throw error;

          if (productData) {
                            setFormData({
                              title: productData.nombre,
                              category: productData.categoria,
                              price: productData.precio.toString(),
                              stock: productData.stock.toString(),
                              description: productData.descripcion,
                              condition: productData.condicion,
                              location: '' // Location is not stored in product data, leave empty
                            });
            
                            // Cargar las imágenes existentes para previsualización
                            const existingImages = [];
                            if (productData.url_imagen) {
                              existingImages.push(productData.url_imagen);
                            }
                            if (productData.imagenes_adicionales) {
                              existingImages.push(...productData.imagenes_adicionales);
                            }
                            setPreviewUrls(existingImages);          }
        } catch (err) {
          console.error("Error fetching product for editing:", err);
          toast.error("No se pudo cargar el producto para editar.");
          navigate('/sell'); // Redirect if product not found or error
        }
      };
      fetchProduct();
    }
  }, [isEditMode, productId, toast, navigate]);

  // --- Lógica de Validación de Perfil Incompleto ---
  const perfilVendedorCompleto = 
    user?.telefono && user.telefono.trim() !== '' &&
    user?.descripcion && user.descripcion.trim() !== '' &&
    user?.ciudad && user.ciudad.trim() !== '' && // Usamos ciudad como ubicacion_publica
    (user?.qr_pago_1_url && user.qr_pago_1_url.trim() !== ''); // Solo se necesita QR1 para el check

  if (isAuthenticated && user && user.rol === 'vendedor' && !perfilVendedorCompleto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="max-w-md w-full text-center">
          <Shield className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Perfil de Vendedor Incompleto</h2>
          <p className="text-gray-600 mb-6">Para poder publicar productos, necesitas completar tu información de contacto y método de pago.</p>
          <Button variant="primary" fullWidth icon={Edit} onClick={() => navigate('/profile', { state: { startEditingSeller: true } })}>
            Completar mi Perfil
          </Button>
        </Card>
      </div>
    );
  }

  // --- Lógica para usuarios no autenticados ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-8 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Card variant="elevated" padding="lg" className="text-center animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Requerido</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">Para vender productos, primero necesitas una cuenta.</p>
            <Button variant="primary" size="lg" fullWidth icon={UserPlus} onClick={() => navigate('/register')}>Crear Cuenta Gratis</Button>
          </Card>
        </div>
      </div>
    );
  }
  
  // --- PANTALLA DE CARGA MIENTRAS SE VERIFICA EL LÍMITE ---
  if (loadingLimit) {
      return <div className="h-screen flex items-center justify-center"><Spinner message="Verificando tu plan..." /></div>
  }

  // --- PANTALLA SI SE ALCANZÓ EL LÍMITE ---
  if (limitReached) {
      const userPlan = user?.plan_suscripcion || 'Vendedor Básico';
      const limit = PLAN_LIMITS[userPlan] || PLAN_LIMITS.basico;
      return <LimitReachedComponent onNavigate={(page) => navigate(`/${page}`)} userPlan={userPlan} productCount={productCount} limit={limit} />
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).filter(file => {

      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });
    if (uploadedImages.length + newFiles.length > 5) {
      toast.warning('Máximo 5 imágenes permitidas');
      return;
    }
    const newPreviewUrls: string[] = [];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          newPreviewUrls.push(ev.target.result as string);
          if (newPreviewUrls.length === newFiles.length) {
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    setUploadedImages(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} imagen(es) agregada(s)`);
  };
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const handleSubmit = async () => {
    if (!user) return;
    setIsPublishing(true);

    try {
      if (isEditMode) {
        // --- LÓGICA DE ACTUALIZACIÓN ---
        const productoActualizado = {
          nombre: formData.title,
          descripcion: formData.description,
          precio: parseFloat(formData.price),
          categoria: formData.category, // Ya es el ID de la categoría
          stock: parseInt(formData.stock, 10) || 1,
          condicion: formData.condition,
        };

        const { error } = await supabase
          .from('productos')
          .update(productoActualizado)
          .eq('id', productId);

        if (error) throw error;
        toast.success(`¡Producto "${formData.title}" actualizado exitosamente!`);
        setTimeout(() => navigate('/mis-productos'), 2000); // Redirigir a la lista de productos

      } else {
        // --- LÓGICA DE CREACIÓN (EXISTENTE) ---
        const urlsImagenes = await subirImagenes(uploadedImages, `prod_${user.id}_${Date.now()}`);
        if (urlsImagenes.length === 0) throw new Error('No se pudo subir ninguna imagen');
        const nuevoProducto = {
          nombre: formData.title,
          descripcion: formData.description,
          precio: parseFloat(formData.price),
          categoria: formData.category, // Ya es el ID de la categoría
          url_imagen: urlsImagenes[0],
          stock: parseInt(formData.stock, 10) || 1,
          activo: true,
          vendedor_id: user.id,
          condicion: formData.condition,
        };
        const { error } = await supabase.from('productos').insert(nuevoProducto);
        if (error) throw error;
        toast.success(`¡Producto "${formData.title}" publicado exitosamente!`);
        setTimeout(() => navigate('/mis-productos'), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar el producto');
    } finally {
      setIsPublishing(false);
    }
  };

  const Step = ({ num, title, active }) => (
    <div className="flex items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>{num}</div>
      <span className={`ml-3 font-medium text-xs sm:text-base ${active ? 'text-blue-600' : 'text-gray-500'}`}>{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between mb-8 px-4 sm:px-6">
          <button onClick={() => navigate('/')} className="p-2 text-gray-600 hover:text-blue-700 mr-4 sm:mr-0 mb-2 sm:mb-0"><ArrowLeft className="w-6 h-6" /></button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Publicar un Producto</h1>
            <p className="text-sm text-gray-600 mt-1 sm:text-base">Has publicado {productCount} de {PLAN_LIMITS[user?.plan_suscripcion || 'basico']} productos.</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8 w-full">
            <Step num={1} title="Información" active={currentStep >= 1} />
            <div className="flex-1 h-px bg-gray-200 mx-2 sm:mx-4"></div>
            <Step num={2} title="Fotos" active={currentStep >= 2} />
            <div className="flex-1 h-px bg-gray-200 mx-2 sm:mx-4"></div>
            <Step num={3} title="Publicar" active={currentStep >= 3} />
          </div>

          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título del producto *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ej: Celular Samsung Galaxy usado" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <div className="relative">
                    <List className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none" disabled={loadingCategories}>
                      <option value="">{loadingCategories ? 'Cargando categorías...' : 'Seleccionar categoría'}</option>
                      {renderCategoryOptions(categories)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio (Bs) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Bs</span>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="150" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado del producto *</label>
                  <div className="relative">
                    <CheckSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none">
                      <option value="">Seleccionar estado</option>
                      <option value="nuevo">Nuevo</option>
                      <option value="usado">Usado</option>
                      <option value="reacondicionado">Reacondicionado</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Unidades *</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="1" min="1" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Fotos y Descripción</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fotos del producto * ({uploadedImages.length}/5)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Haz clic para subir fotos</p>
                  <p className="text-sm text-gray-500">PNG, JPG hasta 10MB (máximo 5 fotos)</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-300" />
                        <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                        {index === 0 && (<div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">Principal</div>)}
                      </div>
                    ))}
                    {uploadedImages.length < 5 && (
                      <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Agregar más</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción detallada *</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder="Describe tu producto..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"><Upload className="w-10 h-10 text-green-600" /></div>
              <h3 className="text-2xl font-bold text-gray-900">¡Listo para Publicar!</h3>
              <p className="text-gray-600 max-w-md mx-auto">Tu producto será revisado y publicado en menos de 30 minutos.</p>
            </div>
          )}
          <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button variant="outline" size="sm" sm:size="lg" onClick={prevStep} disabled={currentStep === 1} className={`w-full sm:w-auto ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}>Anterior</Button>
            <div className="flex-1 text-center py-2 sm:py-0"><span className="text-sm text-gray-500">Paso {currentStep} de 3</span></div>
            <Button variant="primary" size="sm" sm:size="lg" onClick={currentStep === 3 ? handleSubmit : nextStep} className="min-w-[140px] w-full sm:w-auto" disabled={isPublishing}>
              {isPublishing ? <Loader className="w-5 h-5 animate-spin" /> : (currentStep === 3 ? 'Publicar Producto' : 'Siguiente')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VenderPagina;