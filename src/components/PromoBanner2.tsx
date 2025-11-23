import React, { useState, useEffect } from 'react';
import styles from './PromoBanner2.module.css'; // Import the CSS module

interface PromoBanner2Props {
  text: string;
}

const PromoBanner2: React.FC<PromoBanner2Props> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text prop changes
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, 50); // Adjust typing speed here (milliseconds per character)
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <div className="my-8 flex justify-center">
      <div className={`w-full max-w-[1500px] h-[60px] md:h-[100px] rounded-lg flex items-center justify-center p-4 shadow-lg relative overflow-hidden bg-cover bg-center ${styles.promoBannerContainer}`} style={{ backgroundImage: "url('/inicio_images/blueeeee.jpg')" }}>
        {/* Particles */}
        <div className={`${styles.particle} ${styles.particle1}`}></div>
        <div className={`${styles.particle} ${styles.particle2}`}></div>
        <div className={`${styles.particle} ${styles.particle3}`}></div>
        <div className={`${styles.particle} ${styles.particle4}`}></div>
        <div className={`${styles.particle} ${styles.particle5}`}></div>

        <p className={`text-lg md:text-2xl text-white font-elegant text-center font-bold relative z-10 ${styles.fireGlowPulse}`}>
          {displayedText}
        </p>
      </div>
    </div>
  );
};

export default PromoBanner2;
