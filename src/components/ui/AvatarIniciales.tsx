import React from 'react';

interface AvatarInicialesProps {
  nombres?: string;
  apellidos?: string;
  className?: string;
  src?: string; // Prop para la URL de la imagen
}

const AvatarIniciales: React.FC<AvatarInicialesProps> = ({ nombres, apellidos, className = '', src }) => {

  // Si se proporciona una URL de imagen (src), renderizar la imagen
  if (src) {
    return (
      <img
        src={src}
        alt={`Avatar de ${nombres || 'usuario'}`}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  // Comportamiento original si no hay src: mostrar iniciales
  const getInitials = () => {
    const nombreInicial = nombres ? nombres[0] : '';
    const apellidoInicial = apellidos ? apellidos[0] : '';
    return `${nombreInicial}${apellidoInicial}`.toUpperCase();
  };

  const iniciales = getInitials();

  // Paleta de colores para los fondos
  const colores = [
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 
    'bg-teal-500', 'bg-cyan-500'
  ];

  // Asigna un color basado en las iniciales para que sea consistente
  const colorIndex = iniciales.length > 0 ? (iniciales.charCodeAt(0) + (iniciales.charCodeAt(1) || 0)) % colores.length : 0;
  const colorFondo = colores[colorIndex];

  return (
    <div 
      className={`flex items-center justify-center rounded-full text-white font-bold ${colorFondo} ${className}`}
      aria-hidden="true"
    >
      {iniciales}
    </div>
  );
};

export default AvatarIniciales;
