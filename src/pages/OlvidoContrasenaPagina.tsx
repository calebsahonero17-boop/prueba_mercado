import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function OlvidoContrasenaPagina() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password',
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setMessage('Si existe una cuenta con este correo, se ha enviado un enlace para restablecer la contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">¿Olvidaste tu Contraseña?</h2>
          <p className="text-gray-600">No te preocupes. Introduce tu correo y te enviaremos un enlace para restablecerla.</p>
        </div>

        {message ? (
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 text-center">
            <p className="text-green-800 font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              icon={Mail}
              required
              disabled={loading}
              label="Correo Electrónico"
            />
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OlvidoContrasenaPagina;
