import React from 'react';

const VideoBanner = () => {
  return (
    <div className="w-full max-w-[1800px] mx-auto h-auto min-h-[25px] relative overflow-hidden animate-fade-in my-0 mt-[-0.5rem]">
      <video
        className="w-full h-full object-cover rounded-lg shadow-lg"
        src="/videos/mp4_debajo_menu.mp4"
        autoPlay
        loop
        muted
        playsInline
      >
        Tu navegador no soporta la etiqueta de video.
      </video>
    </div>
  );
};

export default VideoBanner;
