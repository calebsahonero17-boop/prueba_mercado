import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Loader, ExternalLink } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Button, Spinner, ImagePreviewModal } from './ui';

interface SolicitudSuscripcion {
  id: string;
  usuario_id: string;
  plan_solicitado: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  nombre_usuario: string;
  email_usuario: string;
  metodo_pago?: string;
  numero_transaccion?: string;
  url_comprobante?: string;
  fecha_solicitud: string;
  fecha_decision?: string;
  admin_id?: string;
  notas_admin?: string;
}

const AdminSubscriptionRequests: React.FC = () => {
  const toast = useToast();
  const [requests, setRequests] = useState<SolicitudSuscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  const openImageModal = async (urlPath: string | null) => {
    if (!urlPath) {
      toast.error('No hay un comprobante asociado a esta solicitud.');
      return;
    }

    // PATCH: Detect old, incorrect data format (full URLs instead of paths)
    if (urlPath.startsWith('http')) {
      toast.error(
        'Este comprobante no se puede visualizar.',
        {
          description: 'Esta solicitud es antigua y el enlace al comprobante se guardó en un formato incorrecto que no se puede recuperar.'
        }
      );
      console.error('Attempted to open an old, invalid URL:', urlPath);
      return;
    }

    // Correct logic for new requests (using file paths)
    const { data, error } = await supabase.storage.from('comprobantes_pago').createSignedUrl(urlPath, 60); // 60 seconds validity
    
    if (error) {
      toast.error('Error al obtener la URL del comprobante: ' + error.message);
      console.error('Error getting signed URL object:', error);
      return;
    }
    
    if (data && data.signedUrl) {
      setSelectedImageUrl(data.signedUrl);
      setIsModalOpen(true);
    } else {
      toast.error('No se pudo obtener la URL segura del comprobante (la respuesta no contenía una URL).');
    }
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImageUrl('');
  };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('solicitudes_suscripcion')
        .select('*')
        .eq('estado', 'pendiente') // Only fetch pending requests
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      console.error('Error fetching subscription requests:', err);
      setError('Error al cargar las solicitudes: ' + err.message);
      toast.error('Error al cargar las solicitudes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleMakeSeller = async (request: SolicitudSuscripcion) => {
    setProcessingId(request.id);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      if (!adminUser) {
        toast.error('Debes iniciar sesión como administrador para realizar esta acción.');
        setProcessingId(null);
        return;
      }

      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 1);

      const { error: profileError } = await supabase
        .from('perfiles')
        .update({
          rol: 'vendedor',
          plan_suscripcion: request.plan_solicitado,
          fecha_expiracion_suscripcion: expirationDate.toISOString(),
        })
        .eq('id', request.usuario_id);

      if (profileError) throw profileError;

      const { error: requestError } = await supabase
        .from('solicitudes_suscripcion')
        .update({
          estado: 'aprobado',
          fecha_decision: new Date().toISOString(),
          admin_id: adminUser.id,
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      toast.success(`Usuario ${request.nombre_usuario} convertido a vendedor con plan ${request.plan_solicitado}. Solicitud aprobada.`);
      // Optimistic update: remove from list immediately
      setRequests(prevRequests => prevRequests.filter(r => r.id !== request.id));
    } catch (err: any) {
      console.error('Error making user a seller in handleMakeSeller:', err);
      toast.error(`Error al convertir a vendedor: ` + err.message);
      // Re-fetch on error to ensure data consistency
      fetchRequests();
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecision = async (id: string, estado: 'aprobado' | 'rechazado') => {
    setProcessingId(id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Debes iniciar sesión como administrador para realizar esta acción.');
        setProcessingId(null);
        return;
      }

      const { error } = await supabase
        .from('solicitudes_suscripcion')
        .update({
          estado: estado,
          fecha_decision: new Date().toISOString(),
          admin_id: user.id,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`La solicitud fue ${estado === 'aprobado' ? 'aprobada' : 'rechazada'} correctamente.`);
      // Optimistic update: remove from list immediately
      setRequests(prevRequests => prevRequests.filter(r => r.id !== id));
    } catch (err: any) {
      console.error('Error updating request status:', err);
      toast.error(`Error al ${estado} la solicitud: ` + err.message);
      // Re-fetch on error to ensure data consistency
      fetchRequests();
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <Spinner message="Cargando solicitudes de suscripción..." />;
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Solicitudes de Suscripción</h2>

        {requests.length === 0 ? (
          <p className="text-gray-600">No hay solicitudes de suscripción pendientes.</p>
        ) : (
          <div className="space-y-4 md:space-y-0">
            {/* Encabezados de la tabla - visibles solo en md y superior */}
            <div className="hidden md:grid md:grid-cols-8 md:gap-4 px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-t-lg">
              <div className="col-span-2">Usuario</div>
              <div>Plan Solicitado</div>
              <div>Método Pago</div>
              <div>Transacción</div>
              <div>Comprobante</div>
              <div>Estado</div>
              <div className="col-span-1 text-right">Acciones</div>
            </div>

            {/* Cuerpo de la lista/tabla */}
            <div className="space-y-4 md:space-y-0">
              {requests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-lg shadow-md md:shadow-none md:rounded-none md:grid md:grid-cols-8 md:gap-4 md:p-0 md:border-b md:border-gray-200">
                  
                  {/* --- Datos del Usuario --- */}
                  <div className="md:col-span-2 flex flex-col md:px-6 md:py-4">
                    <span className="md:hidden text-xs font-medium text-gray-500 uppercase">Usuario</span>
                    <div className="text-sm font-medium text-gray-900">{req.nombre_usuario}</div>
                    <div className="text-sm text-gray-500">{req.email_usuario}</div>
                    <div className="md:hidden text-sm text-gray-500 mt-1">
                      Solicitado: {new Date(req.fecha_solicitud).toLocaleDateString()}
                    </div>
                  </div>

                  {/* --- Plan Solicitado --- */}
                  <div className="mt-2 md:mt-0 md:px-6 md:py-4 flex flex-col justify-center">
                    <span className="md:hidden text-xs font-medium text-gray-500 uppercase">Plan</span>
                    <span className="text-sm text-gray-900">{req.plan_solicitado}</span>
                  </div>

                  {/* --- Método de Pago --- */}
                  <div className="mt-2 md:mt-0 md:px-6 md:py-4 flex flex-col justify-center">
                     <span className="md:hidden text-xs font-medium text-gray-500 uppercase">Método Pago</span>
                    <span className="text-sm text-gray-500">{req.metodo_pago || 'N/A'}</span>
                  </div>

                  {/* --- Transacción --- */}
                  <div className="mt-2 md:mt-0 md:px-6 md:py-4 flex flex-col justify-center">
                    <span className="md:hidden text-xs font-medium text-gray-500 uppercase">Transacción</span>
                    <span className="text-sm text-gray-500">{req.numero_transaccion || 'N/A'}</span>
                  </div>

                  {/* --- Comprobante --- */}
                  <div className="mt-2 md:mt-0 md:px-6 md:py-4 flex flex-col justify-center">
                    <span className="md:hidden text-xs font-medium text-gray-500 uppercase">Comprobante</span>
                    {req.url_comprobante ? (
                      <Button
                        variant="link"
                        onClick={() => openImageModal(req.url_comprobante!)}
                        className="flex items-center p-0 h-auto"
                      >
                        Ver <ExternalLink className="ml-1 w-4 h-4" />
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </div>

                  {/* --- Estado --- */}
                  <div className="mt-2 md:mt-0 md:px-6 md:py-4 flex flex-col justify-center">
                    <span className="md:hidden text-xs font-medium text-gray-500 uppercase">Estado</span>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full self-start ${
                        req.estado === 'aprobado'
                          ? 'bg-green-100 text-green-800'
                          : req.estado === 'rechazado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {req.estado}
                    </span>
                  </div>

                  {/* --- Acciones --- */}
                  <div className="mt-4 md:mt-0 md:col-span-1 md:px-6 md:py-4">
                    {req.estado === 'pendiente' && (
                      <div className="flex flex-col space-y-2 md:items-end">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleMakeSeller(req)}
                          disabled={processingId === req.id}
                          className="w-full md:w-auto"
                        >
                          {processingId === req.id ? (
                            <Loader className="animate-spin w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span className="ml-1">Hacer Vendedor</span>
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDecision(req.id, 'rechazado')}
                          disabled={processingId === req.id}
                          className="w-full md:w-auto"
                        >
                          {processingId === req.id ? (
                            <Loader className="animate-spin w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="ml-1">Rechazar</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ImagePreviewModal
        isOpen={isModalOpen}
        onClose={closeImageModal}
        imageUrl={selectedImageUrl}
        title="Vista Previa del Comprobante"
      />
    </>
  );
};

export default AdminSubscriptionRequests;
