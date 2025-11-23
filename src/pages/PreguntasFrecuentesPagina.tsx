import React from 'react';
import Chatbot from '../components/Chatbot'; // Import the Chatbot component

interface FAQPageProps {
  onNavigate: (page: string) => void;
}

function PreguntasFrecuentesPagina({ onNavigate }: FAQPageProps) {
  return (
    <div className="min-h-screen bg-white flex items-start p-8"> {/* Decreased padding to move it up */}
      <Chatbot /> {/* Render the Chatbot component here */}
    </div>
  );
}

export default PreguntasFrecuentesPagina;