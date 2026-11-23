import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

type MapControllerProps = {
  onMapClick: (coords: { lat: number; lng: number }) => void;
  flyToCoords: { lat: number; lng: number } | null;
};

export const MapController = ({ onMapClick, flyToCoords }: MapControllerProps) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (flyToCoords) {
      map.flyTo([flyToCoords.lat, flyToCoords.lng], 15);
    }
  }, [flyToCoords, map]);

  return null;
};