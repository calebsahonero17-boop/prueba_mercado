import React from 'react';
import { X } from 'lucide-react';
import { Button } from './';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageUrl, title = 'Comprobante' }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-4 relative max-w-lg w-full max-h-[95vh] animate-fade-in"
        onClick={(e) => e.stopPropagation()} // Evita que el click dentro del modal lo cierre
      >
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="w-6 h-6 text-gray-500" />
          </Button>
        </div>
        <div className="overflow-y-auto h-full"> {/* Allow image to dictate height, with scroll */}
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-auto object-contain" 
          />
        </div>
        <div className="flex justify-end mt-4 pt-2 border-t">
           <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
