import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../hooks/useProduct';
import { useChat } from '../hooks/useChat';
import { useFavoritos } from '../contexts/FavoritosContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/ui/Spinner';
import { Button, Badge, Card } from '../components/ui'; // Added Card import
import { ArrowLeft, MapPin, Star, Heart, ShieldCheck, MessageCircle, User as UserIcon, Phone } from 'lucide-react';

export default function ProductoPagina() {
  const { productoId } = useParams<{ productoId: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(productoId);
  const { esFavorito, agregarFavorito, quitarFavorito } = useFavoritos();
  const { startConversation } = useChat(null);
  const toast = useToast();

  const [mainImage, setMainImage] = useState<string | null>(null);

  // Efecto para actualizar la imagen principal cuando el producto se carga o cambia
  React.useEffect(() => {
    if (product?.url_imagen) {
      setMainImage(product.url_imagen);
    }
    // Aquí se podrían añadir más imágenes si el producto tuviera una galería
  }, [product]);

  const vendedor = product?.vendedor;
  const numeroDeContacto = vendedor?.telefono;

  const handleStartChat = async () => {
    if (!vendedor || !product) return toast.error('Vendedor o producto no encontrado.');
    toast.info('Iniciando chat...');
    const conversationId = await startConversation(vendedor.id, product.id);
    if (conversationId) navigate('/mensajes');
    else toast.error('No se pudo iniciar el chat.');
  };

  const abrirWhatsApp = () => {
    if (!numeroDeContacto || !product) return toast.error('El vendedor no tiene un número de WhatsApp.');
    const mensaje = encodeURIComponent(`Hola! Estoy interesado en tu producto: ${product.nombre}\nLo vi en Mercado Express.`);
    const numeroLimpio = numeroDeContacto.replace(/\D/g, '');
    const url = `https://wa.me/${numeroLimpio.startsWith('591') ? numeroLimpio : '591' + numeroLimpio}?text=${mensaje}`;
    window.open(url, '_blank');
    toast.success('Abriendo WhatsApp...');
  };

  if (loading) return <div className="h-screen flex justify-center items-center"><Spinner size="lg" /></div>;
  if (error || !product) return (
    <div className="h-screen flex flex-col justify-center items-center text-center p-4">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar el producto</h2>
      <p className="text-gray-700 mb-6">Es posible que el producto ya no exista o haya sido eliminado.</p>
      <Button onClick={() => navigate('/buy')} icon={ArrowLeft}>Volver a la tienda</Button>
    </div>
  );

  // Asumiendo que podrías tener más imágenes en el futuro
  const imageGallery = [product.url_imagen, 'https://via.placeholder.com/500/cccccc/969696', 'https://via.placeholder.com/500/dddddd/969696', 'https://via.placeholder.com/500/eeeeee/969696'].filter(Boolean);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6"><Button variant="outline" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft}>Volver</Button></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
          {/* Columna Izquierda: Galería de Imágenes */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border">
              <img src={mainImage || product.url_imagen} alt={product.nombre} className="w-full h-full object-contain transition-all duration-300" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {imageGallery.map((img, idx) => (
                <div key={idx} onClick={() => setMainImage(img)} className={`aspect-square bg-gray-100 rounded-lg cursor-pointer overflow-hidden border-2 ${mainImage === img ? 'border-blue-600' : 'border-transparent'}`}>
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Información y Acciones */}
          <div className="space-y-6">
            <div>
              <span className="text-sm font-semibold text-blue-600 uppercase">{product.categoria}</span>
              <h1 className="text-4xl font-extrabold text-blue-700 mt-1 mb-3">{product.nombre}</h1>
              <div className="flex items-center justify-between">
                <span className="text-5xl font-bold text-blue-800">Bs {product.precio.toLocaleString()}</span>
                <Button variant="ghost" size="icon" onClick={() => esFavorito(product.id) ? quitarFavorito(product.id) : agregarFavorito(product.id)} className={`transition-colors ${esFavorito(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                  <Heart className={`w-8 h-8 ${esFavorito(product.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {vendedor && (
              <Card className="p-4 border border-blue-200 shadow-sm"> {/* Changed to Card, added blue border and shadow */}
                <h4 className="font-bold text-blue-700 mb-3">Información del Vendedor</h4> {/* Changed text color */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 text-xl">{vendedor.nombres?.charAt(0)}{vendedor.apellidos?.charAt(0)}</div> {/* Changed bg and text color */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{vendedor.nombres} {vendedor.apellidos}</p>
                    {vendedor.ciudad && <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1"><MapPin size={14} className="text-blue-500" />{vendedor.ciudad}</div>} {/* Changed icon color */}
                  </div>
                  <Button variant="outline" onClick={() => navigate(`/perfil/${vendedor.id}`)} className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700">Ver Perfil</Button> {/* Styled button */}
                </div>
              </Card>
            )}

            <Card className="p-4 border border-blue-200 shadow-sm space-y-2"> {/* Wrapped in Card, added blue border and shadow */}
                <div className="flex items-center"><strong className="w-28 text-blue-700 font-medium">Estado:</strong><Badge variant={product.condicion === 'nuevo' ? 'success' : 'default'}>{product.condicion || 'No especificado'}</Badge></div> {/* Changed text color */}
                <div className="flex items-center"><strong className="w-28 text-blue-700 font-medium">Disponibilidad:</strong><Badge variant={product.stock > 0 ? 'success' : 'danger'}>{product.stock > 0 ? 'Disponible' : 'Agotado'}</Badge></div> {/* Changed text color */}
            </Card>

            <Card className="p-4 border border-blue-200 shadow-sm"> {/* Wrapped in Card, added blue border and shadow */}
              <h3 className="font-bold text-blue-700 mb-2 text-lg">Descripción</h3> {/* Changed text color */}
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.descripcion || 'El vendedor no ha añadido una descripción.'}</p>
            </Card>

            <div className="space-y-3 pt-6 border-t border-blue-200"> {/* Added blue border */}
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md" size="lg" fullWidth icon={MessageCircle} onClick={handleStartChat} disabled={!vendedor || product.stock === 0}>Chatear en la App</Button> {/* Styled button */}
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700" size="lg" fullWidth icon={Phone} onClick={abrirWhatsApp} disabled={!numeroDeContacto || product.stock === 0}>Contactar por WhatsApp</Button> {/* Styled button */}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><ShieldCheck size={20} />Plataforma Segura</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Contacta directamente con vendedores verificados.</li>
                <li>Revisa el perfil y la reputación antes de comprar.</li>
                <li>Plataforma 100% boliviana enfocada en tu seguridad.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
