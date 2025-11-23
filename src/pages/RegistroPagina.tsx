import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, AlertCircle, MapPin, CreditCard } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, Input } from '../components/ui';
import { RegisterData } from '../types/product';
import { supabase } from '../lib/supabase';

interface RegisterPageProps {}

function RegistroPagina() {
  const navigate = useNavigate();
  const { register, loading } = useSupabaseAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<RegisterData>({nombres: '', apellidos: '', email: '', password: '', confirmPassword: '', telefono: '', carnet_identidad: '', ciudad: ''});

  const bolivianCities = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Potosí', 'Tarija', 'Sucre', 'Trinidad', 'Cobija'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLoginSocial = async (provider: 'google') => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast.error(error.message, 'Error de autenticación');
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const success = await register(formData);
    if (success) {
      toast.success('Te has registrado con éxito.', 'Registro Exitoso');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Columna Izquierda: Branding */}
      <div className="hidden lg:block relative">
        <img src="/images/logo_blanco.jpeg" alt="Productos locales de Bolivia" className="w-full h-full object-cover"/>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="bg-gray-50 flex flex-col justify-start items-center p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600">Completa tus datos para unirte a Mercado Express.</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <fieldset className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <legend className="text-xl font-semibold text-gray-800 mb-3">1. Información Personal</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombre(s) *" name="nombres" value={formData.nombres} onChange={handleInputChange} icon={User} required disabled={loading} />
                <Input label="Apellido(s) *" name="apellidos" value={formData.apellidos} onChange={handleInputChange} icon={User} required disabled={loading} />
              </div>
            </fieldset>

            <fieldset className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <legend className="text-xl font-semibold text-gray-800 mb-3">2. Información de Contacto y Verificación</legend>
              <Input label="Email *" type="email" name="email" value={formData.email} onChange={handleInputChange} icon={Mail} required disabled={loading} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Teléfono *" type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} icon={Phone} required disabled={loading} />
                <Input label="Cédula de Identidad (CI) *" name="carnet_identidad" value={formData.carnet_identidad} onChange={handleInputChange} icon={CreditCard} required disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                <select name="ciudad" value={formData.ciudad} onChange={handleInputChange} required disabled={loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Selecciona tu ciudad</option>
                  {bolivianCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </fieldset>

            <fieldset className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
              <legend className="text-xl font-semibold text-gray-800 mb-3">3. Seguridad</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative"><Input label="Contraseña *" type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} icon={Lock} required disabled={loading} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10 text-gray-400">{showPassword ? <EyeOff/> : <Eye/>}</button></div>
                <div className="relative"><Input label="Confirmar Contraseña *" type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} icon={Lock} required disabled={loading} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-10 text-gray-400">{showConfirmPassword ? <EyeOff/> : <Eye/>}</button></div>
              </div>
            </fieldset>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading} className="!text-base">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>

            <div className="relative my-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">O</span></div></div>

            <Button type="button" variant="outline" size="lg" fullWidth onClick={() => handleLoginSocial('google')} disabled={loading}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 mr-3" />
              Continuar con Google
            </Button>

            <p className="text-center text-sm text-gray-600 pt-2">
              ¿Ya tienes cuenta? <button type="button" onClick={() => navigate('/iniciar-sesion')} className="font-medium text-blue-600 hover:text-blue-700">Iniciar Sesión</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistroPagina;
