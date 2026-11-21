import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Place = {
  ID: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  UserID: number;
};

const App = () => {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    const getAllPlaces = async () => {
      const data = await fetch(import.meta.env.VITE_SERVER_URL + '/api/places');
      const obj = await data.json();
      setPlaces(obj);
    };
    getAllPlaces();
  }, []);

  return (
    <>
      <ul>
        {places.map((p) => (
          <li key={p.ID}>
            {p.Name} ({p.Latitude.toFixed(4)}, {p.Longitude.toFixed(4)})
          </li>
        ))}
      </ul>
      <MapContainer
        style={{ height: '400px' }}
        center={[62.59, 29.77]}
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((p) => (
          <Marker key={p.ID} position={[p.Latitude, p.Longitude]}>
            <Popup>{p.Name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default App;
