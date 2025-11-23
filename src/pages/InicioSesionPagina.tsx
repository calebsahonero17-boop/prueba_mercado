import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';
import { Button, Input } from '../components/ui';
import { supabase } from '../lib/supabase';

function InicioSesionPagina() {
  const navigate = useNavigate();
  const { login, loading } = useSupabaseAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const result = await login(formData.email, formData.password);
    if (result.success) {
      toast.success(`¡Hola de nuevo! Qué bueno verte.`, 'Inicio de Sesión Exitoso');
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Columna Izquierda: Branding */}
      <div className="hidden lg:block relative">
        <img 
          src="/images/disposicion-carros-compras-viernes-negro-espacio-copiar_23-2148667047.jpg" 
          alt="Carrito de compras" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white">
          <img src="/logito-footer.png" alt="Mercado Express Logo" className="h-14 mb-4"/>
          <h1 className="text-4xl font-bold">El mercado de Bolivia, en tus manos.</h1>
          <p className="text-lg mt-2 max-w-md">Encuentra productos únicos y apoya a los emprendedores locales.</p>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="bg-gray-50 flex flex-col justify-start items-center p-4 sm:p-8 pt-20">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Bienvenido de vuelta</h2>
            <p className="text-gray-600">Inicia sesión para continuar en Mercado Express</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="tu@email.com" icon={Mail} required disabled={loading} label="Email" />
            
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="Tu contraseña" icon={Lock} required disabled={loading} label="Contraseña" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[40px] text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded"/>Recordarme</label>
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-700">¿Olvidaste tu contraseña?</Link>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading} className="!text-base">
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">O</span></div></div>

            <Button type="button" variant="outline" size="lg" fullWidth onClick={() => handleLoginSocial('google')} disabled={loading}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 mr-3" />
              Continuar con Google
            </Button>

            <p className="text-center text-sm text-gray-600 pt-4">
              ¿No tienes cuenta? <button type="button" onClick={() => navigate('/register')} className="font-medium text-blue-600 hover:text-blue-700">Regístrate aquí</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InicioSesionPagina;
