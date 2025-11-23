import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui'; // Assuming Button is available in ./ui

function FeedbackSection() {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback submitted:', feedback);
    alert('¡Gracias por tu comentario! (Esta es una simulación)');
    setFeedback('');
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-4 py-2 text-sm font-medium mb-4">
          💬 Tu Opinión Importa
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
          ¡Nos encantaría saber <span className="text-blue-600">qué piensas</span>!
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed mb-10">
          Ayúdanos a mejorar tu experiencia en Mercado Express. Tus comentarios son muy valiosos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            rows={6}
            placeholder="Escribe aquí tus comentarios o sugerencias..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          ></textarea>
          <Button type="submit" className="w-full sm:w-auto px-8 py-3 text-lg">
            Enviar Comentario
          </Button>
        </form>
      </div>
    </section>
  );
}

export default FeedbackSection;
