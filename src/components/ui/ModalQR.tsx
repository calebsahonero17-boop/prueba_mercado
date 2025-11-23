
import React from 'react';
import { X } from 'lucide-react';

interface ModalQRProps {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  title: string;
}

const ModalQR: React.FC<ModalQRProps> = ({ isOpen, onClose, qrUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <div className="flex justify-center">
          <img src={qrUrl} alt={title} className="w-80 h-80 object-contain" />
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Escanea este código para realizar el pago.
        </p>
      </div>
    </div>
  );
};

export default ModalQR;
