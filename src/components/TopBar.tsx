import React, { useState, useEffect } from 'react';

function TopBar() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Use 24-hour format
      };
      setCurrentTime(now.toLocaleTimeString('es-BO', options)); // 'es-BO' for Bolivia locale
    };

    updateTime(); // Set initial time
    const intervalId = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="text-white text-xs py-1 px-4 sm:px-6 flex justify-center items-center tracking-wider bg-cover bg-center" style={{ backgroundImage: 'url("/inicio_images/blueeeee.jpg")' }}>
      <p className="text-center font-extrabold animate-blink">
        Santa Cruz, Bolivia | {currentTime}
      </p>
    </div>
  );
}

export default TopBar;