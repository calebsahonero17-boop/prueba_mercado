import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  isSender: boolean; // Para aplicar diferentes estilos
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isSender }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // Se dispara cuando el audio termina de reproducirse
      const handleEnded = () => setIsPlaying(false);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Clases de color condicionales
  const playButtonColor = isSender ? 'text-white' : 'text-gray-700';
  const timeColor = isSender ? 'text-blue-200' : 'text-gray-500';
  const progressBgColor = isSender ? 'bg-blue-300' : 'bg-gray-400';
  const progressIndicatorColor = isSender ? 'bg-white' : 'bg-blue-600';

  return (
    <div className="flex items-center gap-3 w-full">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        preload="metadata"
      />
      <button onClick={togglePlayPause} className={`flex-shrink-0 ${playButtonColor}`}>
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <div className="flex-grow flex items-center gap-2">
        <div className={`w-full h-2 rounded-full ${progressBgColor} relative`}>
          <div 
            className={`h-2 rounded-full ${progressIndicatorColor}`} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`text-xs font-mono ${timeColor}`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default AudioPlayer;
