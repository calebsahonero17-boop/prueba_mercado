import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useProducts } from '../hooks/useProducts';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';
import { Spinner } from '../components/ui/Spinner';
import { Button, Card, Badge } from '../components/ui';
import { AlertCircle, ArrowLeft, Edit, PackagePlus, Trash2, ShoppingBag } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const ProductRow: React.FC<{ 
  product: Product; 
  onUpdate: (productId: string, newStatus: string) => void; 
  onDelete: (productId: string) => void; 
  onEdit: (productId: string) => void; 
}> = ({ product, onUpdate, onDelete, onEdit }) => {
  
  const isSold = product.estado === 'vendido';

  return (
    <div className="w-full p-2 border-b border-gray-200 md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] md:gap-4 md:items-center">

      <div className="flex items-center gap-2 mb-2 md:mb-0">
        <img src={product.url_imagen || '/placeholder.png'} alt={product.nombre} className="w-12 h-12 object-cover rounded-lg"/>
        <div className="flex-1">
          <span className="font-bold text-gray-800 text-sm">{product.nombre}</span>
          <div className="md:hidden text-sm text-gray-600">Bs {product.precio}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2 md:hidden">
        <div>
          <div className="text-xs text-gray-500">Estado</div>
          <Badge variant={isSold ? 'neutral' : 'success'}>{product.estado}</Badge>
        </div>
        <div>
          <div className="text-xs text-gray-500">Stock</div>
          <div>{product.stock}</div>
        </div>
      </div>

      <div className="text-left hidden md:block">
        <Badge variant={isSold ? 'neutral' : 'success'}>{product.estado}</Badge>
      </div>
      <div className="text-left hidden md:block">{product.stock}</div>
      <div className="font-semibold text-left hidden md:block">Bs {product.precio}</div>

      <div className="flex justify-start gap-2">
        <Button 
          variant="outline" 
          className="border-2 border-blue-800 text-blue-800 bg-white hover:bg-blue-50" 
          size="xs" 
          icon={Edit} 
          onClick={() => onEdit(product.id)}
        >
          Editar
        </Button>

        <Button 
          variant="outline" 
          className="border-2 border-blue-800 text-blue-800 bg-white hover:bg-blue-50" 
          size="xs"
          onClick={() => onUpdate(product.id, 'vendido')} 
          disabled={isSold}
        >
          Vendido
        </Button>

        <Button 
          variant="outline" 
          className="border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-50" 
          size="xs" 
          icon={Trash2} 
          onClick={() => onDelete(product.id)}
        />
      </div>
    </div>
  );
};

export default function MisProductosPage() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const { products, loading, error, refetch } = useProducts({ vendedorId: user?.id });

  const updateProductStatus = async (productId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ estado: newStatus })
        .eq('id', productId);

      if (error) throw error;

      toast.success('Producto actualizado');
      refetch();
    } catch (err) {
      toast.error('No se pudo actualizar el producto.');
      console.error(err);
    }
  };

  const deleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productToDelete);

      if (error) throw error;

      toast.success('Producto eliminado permanentemente');
      refetch();

    } catch (err) {
      toast.error('No se pudo eliminar el producto.');
      console.error(err);
    } finally {
      setIsModalOpen(false);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return <Spinner message="Cargando tus productos..." />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <AlertCircle className="mx-auto w-12 h-12" />
        <h2 className="mt-4 text-xl font-bold">Error al cargar tus productos</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              icon={ArrowLeft} 
              onClick={() => navigate('/')} 
              size="sm"
            >
              Inicio
            </Button>

            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
                Mis Productos
              </h1>
              <p className="text-sm text-gray-600 whitespace-nowrap">
                Gestiona el inventario de tu tienda.
              </p>
            </div>
          </div>

          <Button 
            variant="primary" 
            icon={PackagePlus} 
            onClick={() => navigate('/vender')} 
            size="sm" 
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            Añadir Producto
          </Button>
        </div>

        {products.length === 0 ? (
          
          <Card className="text-center p-12">
            <ShoppingBag className="mx-auto w-16 h-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-bold">Aún no tienes productos</h3>
            <p className="mt-2 text-gray-600">
              ¡Añade tu primer producto para empezar a vender!
            </p>
          </Card>

        ) : (
          
          <Card padding="none">

            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-4 items-center p-4 font-bold text-gray-600 border-b bg-gray-50">
              <div>Producto</div>
              <div className="text-left">Estado</div>
              <div className="text-left">Stock</div>
              <div className="text-left">Precio</div>
              <div className="text-left">Acciones</div>
            </div>

            <div>
              {products.map(product => (
                <ProductRow 
                  key={product.id} 
                  product={product} 
                  onUpdate={updateProductStatus} 
                  onDelete={deleteProduct} 
                  onEdit={(productId) => navigate(`/vender/${productId}`)} 
                />
              ))}
            </div>

          </Card>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible."
      />
    </div>
  );
}
