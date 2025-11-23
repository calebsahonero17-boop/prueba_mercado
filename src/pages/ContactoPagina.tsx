import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, MessageSquare, Clock, Send, CheckCircle, Briefcase, Wrench, ShieldCheck, CreditCard, Lightbulb, Users, HelpCircle } from 'lucide-react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface ContactPageProps {}

// --- Componente de Tarjeta de Contacto Rápido ---
const QuickContactCard = ({ icon, title, description, info, actionText, onAction }) => (
  <Card hover={true} clickable={true} onClick={onAction} className="text-center p-6 flex flex-col">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-3 flex-grow">{description}</p>
    <p className="font-semibold text-blue-600 mb-4">{info}</p>
    <Button variant="outline" className="w-full mt-auto">{actionText}</Button>
  </Card>
);

// --- Componente de Tema de Ayuda ---
const SupportTopic = ({ icon, title, description, onClick }) => (
  <button onClick={onClick} className="w-full text-left p-4 rounded-lg hover:bg-gray-100 transition-colors flex items-start space-x-4">
    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-blue-600 mt-1">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </button>
);

// --- Componente Principal de la Página ---
function ContactoPagina() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '', type: 'support'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
  };

  const handleTopicClick = (topicTitle: string) => {
    setFormData(prev => ({ ...prev, subject: topicTitle, type: topicTitle.toLowerCase().replace(/\s/g, '_') }));
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const supportTopics = [
    { title: "Problemas con Ventas", description: "Ayuda con publicaciones, pagos o compradores", icon: <Briefcase/> },
    { title: "Problemas Técnicos", description: "Errores en la plataforma o QR", icon: <Wrench/> },
    { title: "Verificación de Cuenta", description: "Problemas con CI o documentos", icon: <ShieldCheck/> },
    { title: "Pagos y Facturación", description: "Consultas sobre comisiones o pagos", icon: <CreditCard/> },
    { title: "Sugerencias", description: "Ideas para mejorar la plataforma", icon: <Lightbulb/> },
    { title: "Alianzas Comerciales", description: "Propuestas de negocio o partnerships", icon: <Users/> },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Mensaje Enviado!</h2>
          <p className="text-gray-600 mb-8">Recibimos tu consulta. Nuestro equipo se pondrá en contacto contigo a la brevedad.</p>
          <Button variant="primary" onClick={() => navigate('/')} className="w-full">Volver al Inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* --- Encabezado --- */}
        <div className="flex items-center mb-10">
          <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-3">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Centro de Ayuda</h1>
            <p className="text-lg text-gray-600 mt-1">Estamos aquí para ayudarte a resolver cualquier duda.</p>
          </div>
        </div>

        {/* --- Tarjetas de Contacto Rápido --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <QuickContactCard icon={<MessageSquare size={28}/>} title="Chat en Vivo" description="Respuesta inmediata de nuestro equipo." info="Disponible 24/7" actionText="Abrir Chat" onAction={() => {}} />
          <QuickContactCard icon={<Phone size={28}/>} title="Teléfono" description="Llámanos para ayuda inmediata." info="+591 2 2345678" actionText="Llamar Ahora" onAction={() => {}} />
          <QuickContactCard icon={<Mail size={28}/>} title="Email" description="Envíanos tu consulta detallada." info="mercadoexpressbolivia@gmail.com" actionText="Enviar Email" onAction={() => window.location.href = 'mailto:mercadoexpressbolivia@gmail.com'} />
        </div>

        {/* --- Layout Principal (Formulario y Ayuda) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16">

          {/* --- Columna Izquierda: Formulario --- */}
          <div id="contact-form" className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Envíanos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre Completo *" type="text" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Tu nombre" />
                <Input label="Email *" type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="tu@email.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input label="Teléfono" type="tel" name="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+591 XXXXXXXX" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Consulta *</label>
                  <select name="type" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    <option value="support">Soporte Técnico</option>
                    <option value="sales">Problemas con Ventas</option>
                    <option value="payments">Pagos y Facturación</option>
                    <option value="verification">Verificación</option>
                    <option value="suggestion">Sugerencia</option>
                    <option value="partnership">Alianzas</option>
                  </select>
                </div>
              </div>
              <Input label="Asunto *" type="text" name="subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="Resumen de tu consulta" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
                <textarea name="message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Describe tu consulta en detalle..."></textarea>
              </div>
              <Button type="submit" variant="primary" size="lg" className="w-full !text-lg">
                <Send className="w-5 h-5 mr-2" />
                Enviar Mensaje
              </Button>
            </form>
          </div>

          {/* --- Columna Derecha: Temas de Ayuda e Info --- */}
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">¿En qué te podemos ayudar?</h3>
              <div className="space-y-1">
                {supportTopics.map(topic => <SupportTopic key={topic.title} {...topic} onClick={() => handleTopicClick(topic.title)} />)}
              </div>
            </Card>

            <Card className="bg-blue-50 border border-blue-200 p-6 text-center">
                <HelpCircle className="w-10 h-10 text-blue-600 mx-auto mb-3"/>
                <h3 className="text-lg font-bold text-blue-900 mb-2">¿Buscas una Respuesta Rápida?</h3>
                <p className="text-blue-800 mb-4">Revisa nuestras preguntas frecuentes, podrías encontrar la solución al instante.</p>
                <Button variant="outline" onClick={() => navigate('/preguntas-frecuentes')} className="w-full bg-white">Ver Preguntas Frecuentes</Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Información de Contacto</h3>
              <div className="space-y-4 text-sm">
                  <div className="flex"><MapPin className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"/><div><strong className="block">Oficina Principal</strong>Av. Arce 2345, La Paz</div></div>
                  <div className="flex"><Phone className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"/><div><strong className="block">Teléfonos</strong>Soporte: +591 77616366<br/>Ventas: +591 2 2345679</div></div>
                  <div className="flex"><Clock className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"/><div><strong className="block">Horarios</strong>L-V: 8:00 - 18:00<br/>Sáb: 9:00 - 13:00</div></div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ContactoPagina;