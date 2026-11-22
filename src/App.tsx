import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place, User } from './types';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { AddPlaceForm } from './components/AddPlaceForm';
import { MapController } from './components/MapController';

const STORAGE_KEY = 'places_app_user';

const App = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handlePlaceAdded = (newPlace: Place) => {
    setPlaces((prev) => [...prev, newPlace]);
    setSelectedCoords(null);
  };

  useEffect(() => {
    const getAllPlaces = async () => {
      const data = await fetch(import.meta.env.VITE_SERVER_URL + '/api/places');
      const obj = await data.json();
      setPlaces(obj);
    };
    getAllPlaces();
  }, []);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedCoords(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {user ? (
        <div>
          <p>
            Logged in as <strong>{user.Name}</strong> (ID: {user.ID}){' '}
            <button type="button" onClick={handleLogout}>
              Log Out
            </button>
          </p>
        </div>
      ) : (
        <div>
          <LoginForm onLogin={handleAuthSuccess} />
          <SignupForm onSignup={handleAuthSuccess} />
        </div>
      )}

      <hr />

      {user && user.Token && (
        <AddPlaceForm
          key={selectedCoords ? `${selectedCoords.lat}-${selectedCoords.lng}` : 'empty'}
          user={user}
          selectedCoords={selectedCoords}
          onPlaceAdded={handlePlaceAdded}
          onLocationFound={(coords) => {
            setSelectedCoords(coords);
            setFlyToCoords(coords);
          }}
        />
      )}

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
        <MapController
          onMapClick={(coords) => {
            if (user && user.Token) setSelectedCoords(coords);
          }}
          flyToCoords={flyToCoords}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((p) => (
          <Marker key={p.ID} position={[p.Latitude, p.Longitude]}>
            <Popup>{p.Name}</Popup>
          </Marker>
        ))}

        {selectedCoords && (
          <Marker position={[selectedCoords.lat, selectedCoords.lng]}>
            <Popup>New place location</Popup>
          </Marker>
        )}
      </MapContainer>
    </>
  );
};

export default App;