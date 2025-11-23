import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Pedido } from '../types/product';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { subirArchivo } from '../lib/storage';
import { Spinner } from '../components/ui/Spinner';
import { Card, Button } from '../components/ui';
import { CheckCircle, ArrowLeft, UploadCloud, AlertTriangle, Loader, ExternalLink } from 'lucide-react';

interface ConfirmacionPedidoPageProps {
  onNavigate: (page: string) => void;
}

function ConfirmacionPedidoPage({ onNavigate }: ConfirmacionPedidoPageProps) {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useSupabaseAuth();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [vendedor, setVendedor] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchPedidoYVendedor = async () => {
      if (!orderId) {
        toast.error('No se proporcionó un ID de pedido.');
        setCargando(false);
        return;
      }

      try {
        const { data: pedidoData, error: pedidoError } = await supabase
          .from('pedidos')
          .select('*')
          .eq('id', orderId)
          .single();

        if (pedidoError) throw new Error(`Error al cargar el pedido: ${pedidoError.message}`);
        
        if (pedidoData) {
          const { data: detallesData, error: detallesError } = await supabase
            .from('detalle_pedidos')
            .select('*, producto:productos(*)')
            .eq('pedido_id', pedidoData.id);

          if (detallesError) throw new Error(`Error al cargar detalles: ${detallesError.message}`);

          const pedidoCompleto = { ...pedidoData, detalles: detallesData || [] };
          setPedido(pedidoCompleto);

          if (pedidoData.vendedor_id) {
            const { data: vendedorData, error: vendedorError } = await supabase
              .from('perfiles')
              .select('nombres, apellidos, qr_pago_url')
              .eq('id', pedidoData.vendedor_id)
              .single();
            if (vendedorError) throw new Error(`Error al cargar el vendedor: ${vendedorError.message}`);
            setVendedor(vendedorData);
          } else {
            throw new Error('Este pedido no tiene un vendedor asociado.');
          }
        } else {
          setPedido(null);
        }

      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setCargando(false);
      }
    };

    fetchPedidoYVendedor();
  }, [orderId, toast]);

  const handleSubirComprobante = async () => {
    if (!comprobante || !pedido || !user) {
      toast.error('Por favor, selecciona un archivo y asegúrate de que el pedido se haya cargado correctamente.');
      return;
    }

    setSubiendo(true);
    try {
      toast.info('Subiendo comprobante...');
      const rutaArchivo = `${user.id}/${pedido.id}/${comprobante.name}`;
      const path = await subirArchivo(comprobante, 'comprobantes', rutaArchivo);

      const { error: updateError } = await supabase
        .from('pedidos')
        .update({
          comprobante_pago_url: path, // Guardamos la RUTA, no la URL
          estado_pago: 'en_verificacion'
        })
        .eq('id', pedido.id);

      if (updateError) {
        throw new Error(`No se pudo actualizar el pedido: ${updateError.message}`);
      }

      setPedido(prev => prev ? { ...prev, comprobante_pago_url: path, estado_pago: 'en_verificacion' } : null);
      toast.success('¡Comprobante subido! El vendedor verificará tu pago pronto.');

    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error al subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  };

  const handleVerComprobante = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('comprobantes')
        .createSignedUrl(path, 300); // URL válida por 5 minutos

      if (error) {
        throw error;
      }
      
      window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      toast.error(`No se pudo generar el enlace para ver el comprobante: ${error.message}`);
    }
  };

  if (cargando) {
    return <Spinner message="Cargando confirmación de tu pedido..." />;
  }

  if (!pedido) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="mx-auto w-12 h-12 text-red-500" />
        <h2 className="mt-4 text-xl font-bold">Pedido no encontrado</h2>
        <p className="mt-2 text-gray-600">No pudimos encontrar los detalles de tu pedido.</p>
        <Button onClick={() => onNavigate('home')} className="mt-4">Volver al Inicio</Button>
      </div>
    );
  }

  const pagoEnVerificacion = pedido.estado_pago === 'en_verificacion';
  const pagoRealizado = pedido.estado_pago === 'pagado';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 mt-4">¡Gracias por tu pedido!</h1>
            <p className="text-gray-600 mt-1">Tu pedido <span className="font-bold">#{pedido.numero_pedido}</span> ha sido creado.</p>
          </div>

          {!pagoRealizado && (
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-lg font-semibold text-center mb-4">Siguientes Pasos: Realiza el Pago</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p><strong>1. Paga el total de Bs {pedido.total.toFixed(2)}</strong> escaneando el siguiente código QR con tu aplicación bancaria.</p>
                <p className="mt-2"><strong>2. Sube un comprobante de pago.</strong> Toma una captura de pantalla de la transferencia exitosa.</p>
                <p className="mt-2"><strong>3. ¡Listo!</strong> El vendedor será notificado para verificar tu pago y procesar tu envío.</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center">
            {vendedor?.qr_pago_url ? (
              <img src={vendedor.qr_pago_url} alt="Código QR del Vendedor" className="w-56 h-56 border-4 border-white shadow-lg rounded-lg" />
            ) : (
              <div className="w-56 h-56 bg-gray-100 flex items-center justify-center text-center p-4 rounded-lg">
                <p className="text-sm text-gray-600">El vendedor aún no ha configurado un código QR.</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">Vendido por: <strong>{vendedor?.nombres || '...'} {vendedor?.apellidos || ''}</strong></p>
          </div>

          {(pagoEnVerificacion || pagoRealizado) ? (
            <div className="mt-6 pt-6 border-t text-center">
              <h3 className="text-lg font-semibold text-gray-800">Comprobante Enviado</h3>
              <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-800">Tu comprobante de pago ha sido enviado. El vendedor lo revisará pronto.</p>
                {pedido.comprobante_pago_url && 
                  <Button 
                    variant="link"
                    icon={ExternalLink}
                    onClick={() => handleVerComprobante(pedido.comprobante_pago_url!)}
                    className="mt-2"
                  >
                    Ver comprobante
                  </Button>
                }
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-center mb-4">Sube tu Comprobante de Pago</h3>
              <div className="flex flex-col items-center gap-4">
                <label className="w-full max-w-sm flex flex-col items-center px-4 py-6 bg-white text-blue-600 rounded-lg shadow-md tracking-wide uppercase border border-blue-300 cursor-pointer hover:bg-blue-500 hover:text-white">
                  <UploadCloud className="w-8 h-8" />
                  <span className="mt-2 text-base leading-normal">{comprobante ? comprobante.name : 'Seleccionar un archivo'}</span>
                  <input type='file' className="hidden" onChange={(e) => setComprobante(e.target.files ? e.target.files[0] : null)} accept="image/png, image/jpeg, image/webp, application/pdf" />
                </label>
                <Button onClick={handleSubirComprobante} disabled={!comprobante || subiendo} icon={subiendo ? Loader : CheckCircle}>
                  {subiendo ? 'Subiendo...' : 'Confirmar Subida'}
                </Button>
              </div>
            </div>
          )}
        </Card>
        <div className="text-center mt-6">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => onNavigate('mis-pedidos')}>Ir a Mis Pedidos</Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmacionPedidoPage;
