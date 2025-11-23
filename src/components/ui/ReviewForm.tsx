import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import Button from './Button';
import Card from './Card';

import { Spinner } from './Spinner';
import { supabase } from '../../lib/supabase';

import { ToastActions, User } from '../../types/product';

interface ReviewFormProps {
  vendedorId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void; // Para refrescar la lista de reseñas
  toast: ToastActions;
  user: User | null;
}

export default function ReviewForm({ vendedorId, isOpen, onClose, onReviewSubmitted, toast, user }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para dejar una reseña.');
      return;
    }
    if (rating === 0) {
      toast.error('Por favor, selecciona una calificación de estrellas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('reseñas').insert({
        vendedor_id: vendedorId,
        comprador_id: user.id,
        calificacion: rating,
        comentario: comment,
      });

      if (error) {
        // Manejar el caso en que el usuario ya ha dejado una reseña
        if (error.code === '23505') { // Código de error para violación de unicidad
          toast.error('Ya has dejado una reseña para este vendedor.');
        } else {
          throw error;
        }
      } else {
        toast.success('¡Gracias por tu reseña!');
        onReviewSubmitted(); // Llama a la función para refrescar
        onClose(); // Cierra el modal
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast.error('No se pudo enviar la reseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card padding="lg" className="relative w-full max-w-lg animate-scale-in">
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5" /></Button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Escribe tu reseña</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tu calificación</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={32}
                      className="cursor-pointer transition-colors text-yellow-400"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Tu comentario (opcional)</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe tu experiencia con el vendedor..."
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" icon={isSubmitting ? Spinner : Send} disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Reseña'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
