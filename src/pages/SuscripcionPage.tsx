import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import Button from '../components/ui/Button';
import { ArrowLeft, CheckCircle, CreditCard, Package, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// --- Definición de Planes ---
const planes = [
  {
    id: 'basico',
    nombre: 'Vendedor Básico',
    precio: 10,
    caracteristicas: [
      'Publica hasta 3 productos',
      'Soporte por correo electrónico',
      'Panel de vendedor estándar',
    ],
  },
  {
    id: 'premium',
    nombre: 'Vendedor Premium',
    precio: 20,
    caracteristicas: [
      'Publica hasta 7 productos',
      'Soporte prioritario por WhatsApp',
      'Productos destacados en búsquedas',
      'Insignia Premium en tu perfil',
    ],
    destacado: true,
  },
];

// --- Componente de Tarjeta de Plan ---
const PlanCard = ({ plan, isSelected, onSelect }) => (
  <div
    onClick={() => onSelect(plan)}
    className={`relative border rounded-xl p-6 cursor-pointer transition-all duration-300 ease-in-out ${
      isSelected
        ? 'border-blue-600 ring-2 ring-blue-600 shadow-2xl scale-105 bg-white'
        : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:shadow-lg'
    }`}
  >
    {plan.destacado && (
      <div className="absolute top-0 right-0 -mt-3 -mr-3">
        <div className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded-full">
          Recomendado
        </div>
      </div>
    )}
    <h3 className="text-2xl font-bold text-gray-800">{plan.nombre}</h3>
    <p className="text-5xl font-extrabold my-4 text-gray-900">
      {plan.precio} Bs
      <span className="text-xl font-medium text-gray-500">/ mes</span>
    </p>
    <ul className="space-y-3 text-gray-600 mb-8">
      {plan.caracteristicas.map((car) => (
        <li key={car} className="flex items-start">
          <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-1" />
          <span>{car}</span>
        </li>
      ))}
    </ul>
    <Button variant={isSelected ? 'primary' : 'outline'} fullWidth size="lg">
      {isSelected ? 'Plan Seleccionado' : 'Seleccionar Plan'}
    </Button>
  </div>
);

// --- Componente de Éxito ---
const SuccessDisplay = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">¡Solicitud Recibida!</h1>
        <p className="text-gray-600 mb-8">
          Hemos recibido tu confirmación de pago. Un administrador la verificará pronto. Recibirás una notificación cuando tu cuenta de vendedor sea activada.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Volver al Inicio
        </Button>
      </div>
    </div>
  );
};

// --- Componente Principal de la Página ---
function SuscripcionPage() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();
  const [planSeleccionado, setPlanSeleccionado] = useState(planes.find(p => p.destacado) || planes[0]);
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'enviado' | 'error'>('inicial');
  const [error, setError] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('qr_simple');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'qr_simple', name: 'QR Simple' },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setPaymentProof(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPaymentProofPreview(null);
    }
  };

    const handleConfirmarPago = async () => {
      if (!user) {
        setError('Debes iniciar sesión para suscribirte.');
        setEstado('error');
        return;
      }
  
      if (!selectedPaymentMethod) {
        setError('Por favor, selecciona un método de pago.');
        setEstado('error');
        return;
      }
  
      if (!paymentProof) { // Now mandatory
        setError('Por favor, sube el comprobante de pago.');
        setEstado('error');
        return;
      }
  
      setEstado('enviando');
      setError('');
      let paymentProofUrl: string | null = null;
  
      try {
        // 1. Upload payment proof (now mandatory)
        const fileExtension = paymentProof.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('comprobantes_pago')
          .upload(filePath, paymentProof, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Use the path returned from the storage API to guarantee correctness
        if (!uploadData?.path) {
          throw new Error("La subida del archivo no devolvió una ruta válida.");
        }
        paymentProofUrl = uploadData.path;
  
        // 2. Insert subscription request with payment details
        const { error: insertError } = await supabase
          .from('solicitudes_suscripcion')
          .insert({
              usuario_id: user.id,
              plan_solicitado: planSeleccionado.nombre,
              nombre_usuario: `${user.nombres} ${user.apellidos}`,
              email_usuario: user.email,
              metodo_pago: selectedPaymentMethod,
              numero_transaccion: null, // transactionId is no longer required
              url_comprobante: paymentProofUrl,
          });
        if (insertError) throw insertError;
        setEstado('enviado');
      } catch (err: any) {
        console.error('Error al registrar la solicitud:', err);
        if (err.code === '23505') {
          setError('Ya tienes una solicitud de suscripción pendiente. Por favor, espera a que sea aprobada.');
        } else {
          setError('Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.');
        }
        setEstado('error');
      }
    };
  if (estado === 'enviado') {
    return <SuccessDisplay />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* --- Encabezado --- */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-3">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Conviértete en Vendedor</h1>
            <p className="text-lg text-gray-600 mt-1">Elige el plan que mejor se adapte a tu negocio.</p>
          </div>
        </div>

        {/* --- Contenido Principal --- */}
        <div className="grid lg:grid-cols-3 gap-12 mt-10">
          
          {/* --- Columna de Planes --- */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg">1</div>
              <h2 className="text-2xl font-bold text-gray-800 ml-4">Elige tu Plan</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-8">
              {planes.map(plan => (
                <PlanCard key={plan.id} plan={plan} isSelected={plan.id === planSeleccionado.id} onSelect={setPlanSeleccionado} />
              ))}
            </div>
          </div>

          {/* --- Columna de Pago y Confirmación --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-2xl shadow-lg sticky top-8">
              
                                          {/* Paso 2: Realiza el Pago QR */}
                                          <div className="flex items-center mb-5">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg">2</div>
                                            <h2 className="text-2xl font-bold text-gray-800 ml-4">Realiza el Pago QR</h2>
                                          </div>
                                          <p className="text-gray-600 mb-4">
                                            Escanea el QR para pagar <strong>{planSeleccionado.precio} Bs</strong> por el plan <strong>{planSeleccionado.nombre}</strong>.
                                          </p>              
                                          <p className="text-lg font-medium text-gray-800 mb-6">Método de pago seleccionado: <span className="font-bold">QR Simple</span></p>              
                                          <div className="flex justify-center items-center bg-white p-2 border-4 border-gray-200 rounded-xl mb-6">
                                            <img src="/inicio_images/qr_oficial_mercado.jpeg" alt="Código QR para pago" className="w-full h-auto rounded-md" />
                                          </div>              
                            <hr className="my-8 border-gray-200" />
              
                            {/* Paso 3: Confirma tu Pago */}
                            <div className="flex items-center mb-5">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-lg">3</div>
                              <h2 className="text-2xl font-bold text-gray-800 ml-4">Confirma tu Pago</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                              Una vez pagado, sube el comprobante de pago para notificarnos.
                            </p>
              
                            <div className="mb-6">
                              <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700 mb-2">
                                Comprobante de Pago (captura de pantalla) *
                              </label>
                              <input
                                type="file"
                                id="paymentProof"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required // Make it mandatory
                              />
                              {paymentProofPreview && (
                                <div className="mt-4">
                                  <img src={paymentProofPreview} alt="Comprobante de Pago" className="max-w-xs h-auto rounded-lg shadow-md" />
                                </div>
                              )}
                            </div>
              
                            <Button
                              variant="primary"
                              size="lg"
                              className="w-full !text-lg"
                              onClick={handleConfirmarPago}
                              disabled={estado === 'enviando' || !selectedPaymentMethod || !paymentProof} // Adjusted disabled condition
                            >
                              {estado === 'enviando' ? 'Enviando...' : 'Confirmar Pago'}
                              {estado !== 'enviando' && <Send className="w-5 h-5 ml-2" />}
                            </Button>
                            {estado === 'error' && <p className="text-red-600 mt-3 text-center font-medium">{error}</p>}            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuscripcionPage;
