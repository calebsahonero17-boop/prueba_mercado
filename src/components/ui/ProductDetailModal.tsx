import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Star, Heart, Shield, Phone, User as UserIcon, MessageCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { useFavoritos } from '../../contexts/FavoritosContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import Button from './Button';
import Badge from './Badge';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

interface VendedorInfo {
  id: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  ciudad?: string;
  avatar?: string;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const navigate = useNavigate();
  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritos();
  const toast = useToast();
  const [vendedor, setVendedor] = useState<VendedorInfo | null>(null);
  const [loadingVendedor, setLoadingVendedor] = useState(false);

  useEffect(() => {
    const cargarVendedor = async () => {
      if (!product?.vendedor_id) {
        setVendedor(null);
        return;
      }

      setLoadingVendedor(true);
      try {
        const { data, error } = await supabase
          .from('perfiles')
          .select('id, nombres, apellidos, telefono, ciudad, avatar')
          .eq('id', product.vendedor_id)
          .single();

        if (error) throw error;
        setVendedor(data);
      } catch (error) {
        console.error('Error cargando vendedor:', error);
        setVendedor(null);
      } finally {
        setLoadingVendedor(false);
      }
    };

    if (isOpen && product) {
      cargarVendedor();
    }
  }, [product?.vendedor_id, isOpen]);

  if (!isOpen || !product) return null;

  const numeroDeContacto = vendedor?.telefono;

  const crearNotificacion = async () => {
    if (!vendedor || !product) return;
    try {
      const { error } = await supabase.rpc('crear_notificacion_de_contacto', {
        destinatario_id_in: vendedor.id,
        producto_id_in: product.id
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const abrirWhatsApp = () => {
    if (numeroDeContacto) {
      const mensaje = encodeURIComponent(`Hola! Estoy interesado en tu producto: ${product.nombre}\nLo vi en Mercado Express.`);
      const numeroLimpio = numeroDeContacto.replace(/\D/g, '');
      const url = `https://wa.me/${numeroLimpio.startsWith('591') ? numeroLimpio : '591' + numeroLimpio}?text=${mensaje}`;
      window.open(url, '_blank');
      toast.success('Abriendo WhatsApp...');
      crearNotificacion();
    } else {
      toast.error('El vendedor no ha proporcionado un número de WhatsApp.');
    }
  };

  const verPerfilVendedor = () => {
    if (vendedor?.id) {
      crearNotificacion();
      onClose();
      navigate(`/profile/${vendedor.id}`);
    } else {
      toast.info('No se pudo encontrar el perfil del vendedor.');
    }
  };

  const toggleFavorite = () => {
    if (esFavorito(product.id)) {
      quitarFavorito(product.id);
    } else {
      agregarFavorito(product.id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Detalles del Producto</h2>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Images & Seller Info */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border">
                    {product.url_imagen ? <img src={product.url_imagen} alt={product.nombre} className="w-full h-full object-cover" /> : <div className="text-8xl">📦</div>}
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3">Información del Vendedor</h4>
                    {loadingVendedor ? (
                      <div className="text-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    ) : vendedor ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {vendedor.avatar || `${vendedor.nombres?.charAt(0)}${vendedor.apellidos?.charAt(0)}`}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{vendedor.nombres} {vendedor.apellidos}</p>
                          {vendedor.ciudad && <div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><MapPin className="w-3 h-3" />{vendedor.ciudad}</div>}
                        </div>
                        <Button variant="outline" size="icon" onClick={verPerfilVendedor}><UserIcon className="w-4 h-4"/></Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">Vendedor no disponible</p>
                    )}
                  </div>
                </div>

                {/* Product Info & Actions */}
                <div className="space-y-6">
                  <div>
                    {product.destacado && <Badge variant="warning" className="mb-2">🌟 DESTACADO</Badge>}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.nombre}</h1>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-3xl font-bold text-green-600">Bs {product.precio.toLocaleString()}</span>
                      <Button variant="ghost" size="sm" onClick={toggleFavorite} className={esFavorito(product.id) ? 'text-red-500' : 'text-gray-400'}>
                        <Heart className={`w-5 h-5 ${esFavorito(product.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-sm font-medium text-gray-500">Estado:</span><p className="font-medium">{product.condicion || 'Nuevo'}</p></div>
                    <div><span className="text-sm font-medium text-gray-500">Disponibilidad:</span><p className="font-medium text-green-600">{product.stock > 0 ? 'Disponible' : 'Agotado'}</p></div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-700 leading-relaxed">{product.descripcion || `${product.nombre} en excelente estado.`}</p>
                  </div>

                  {/* Action Buttons - Refactored */}
                  <div className="space-y-3 pt-4 border-t">
                     <Button 
                        variant="success" 
                        size="lg" 
                        fullWidth 
                        icon={MessageCircle} 
                        onClick={abrirWhatsApp} 
                        className="shadow-lg hover:shadow-xl bg-green-600 hover:bg-green-700"
                        disabled={!numeroDeContacto || product.stock === 0}
                      >
                        {product.stock === 0 ? 'Agotado' : 'Contactar por WhatsApp'}
                      </Button>
                    <Button 
                        variant="outline" 
                        size="lg" 
                        fullWidth 
                        icon={UserIcon} 
                        onClick={verPerfilVendedor}
                        disabled={product.stock === 0}
                      >
                        Ver Perfil del Vendedor
                    </Button>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Shield className="w-5 h-5" />Plataforma Segura</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Vendedores verificados</li>
                      <li>✓ Contacto directo y sin intermediarios</li>
                      <li>✓ Plataforma 100% boliviana</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}