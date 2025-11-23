import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

interface GoogleMapDisplayProps {
  lat: number;
  lng: number;
}

const GoogleMapDisplay: React.FC<GoogleMapDisplayProps> = ({ lat, lng }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const center = {
    lat: lat,
    lng: lng
  };

  if (loadError) {
    return <div>Error al cargar el mapa. Asegúrate de que la clave de API sea correcta.</div>;
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
    >
      <Marker position={center} />
    </GoogleMap>
  ) : <div>Cargando mapa...</div>;
}

export default GoogleMapDisplay;
