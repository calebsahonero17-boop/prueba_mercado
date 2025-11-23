
import { useState, useEffect } from 'react';

// Hook personalizado para debounce
// Retrasa la actualización de un valor hasta que ha pasado un tiempo determinado sin que cambie.
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar el valor "debounced" (retrasado)
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crea un temporizador que actualizará el estado después del 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Función de limpieza: se ejecuta si el valor cambia antes de que se cumpla el delay.
    // Esto cancela el temporizador anterior y lo reinicia.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
}
