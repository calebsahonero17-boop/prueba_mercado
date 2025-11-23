import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Coordenadas por defecto (centro de Bolivia)
const defaultCenter = {
  lat: -16.290154,
  lng: -63.588653
};

interface GoogleMapInputProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

const GoogleMapInput: React.FC<GoogleMapInputProps> = ({ lat, lng, onLocationChange }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-input-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'], // Habilitar la librería de Places para Autocomplete
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const center = lat && lng ? { lat, lng } : defaultCenter;
  const markerPosition = lat && lng ? { lat, lng } : null;

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onLocationChange({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  }, [onLocationChange]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onLocationChange(newCoords);
        map?.panTo(newCoords);
        map?.setZoom(15);
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  if (loadError) {
    return <div>Error al cargar el mapa. Revisa la clave de API y la conexión.</div>;
  }

  return isLoaded ? (
    <div className="relative">
      <Autocomplete
        onLoad={onAutocompleteLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          placeholder="Busca la dirección de tu negocio aquí..."
          className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 z-10 relative"
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={lat && lng ? 15 : 6} // Zoom más lejano si no hay ubicación
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </div>
  ) : <div>Cargando mapa...</div>;
}

export default GoogleMapInput;
