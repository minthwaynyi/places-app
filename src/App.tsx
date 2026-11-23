import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place, User } from './types';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { AddPlaceForm } from './components/AddPlaceForm';
import { MapController } from './components/MapController';
import { EditPlaceForm } from './components/EditPlaceForm';
import { DeletePlaceButton } from './components/DeletePlaceButton';
import { ThemeToggle } from './components/ThemeToggle';

const STORAGE_KEY = 'places_app_user';

const FlyTo = ({ place }: { place?: Place }) => {
  const map = useMap();
  const lat = place?.Latitude;
  const lng = place?.Longitude;
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) map.flyTo([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

const App = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
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
      try {
        const res = await fetch(import.meta.env.VITE_SERVER_URL + '/api/places');
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        setPlaces(await res.json());
      } catch (err) {
        console.error('Failed to load places:', err);
      }
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

  const handleSelect = (id: number) => {
    setSelectedId(id);
    if (editingId !== id) setEditingId(null);
  };

  const handlePlaceSaved = (id: number, name: string) => {
    setPlaces((prev) => prev.map((p) => (p.ID === id ? { ...p, Name: name } : p)));
    setEditingId(null);
  };

  const handlePlaceDeleted = (id: number) => {
    setPlaces((prev) => prev.filter((p) => p.ID !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    
    <>
    <div style={{ textAlign: 'right' }}>
      <ThemeToggle />
    </div>
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
          user={user}
          selectedCoords={selectedCoords}
          onCoordsChange={setSelectedCoords}
          onPlaceAdded={handlePlaceAdded}
          onLocationFound={(coords) => {
            setSelectedCoords(coords);
            setFlyToCoords(coords);
          }}
        />
      )}

      <ul>
        {places.map((p) => (
          <li
              key={p.ID}
              className={user && p.UserID === user.ID ? 'owned' : undefined}
              onClick={() => handleSelect(p.ID)}
              style={{
                cursor: 'pointer',
                background: p.ID === selectedId ? 'var(--selected-bg)' : undefined,
                padding: '4px 8px',
                ...(p.ID === selectedId && { borderLeftColor: 'var(--accent)' }),
              }}
            >
            {user && editingId === p.ID ? (
              <EditPlaceForm
                place={p}
                user={user}
                onSaved={handlePlaceSaved}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                {p.Name} ({p.Latitude.toFixed(4)}, {p.Longitude.toFixed(4)})
                {user && p.UserID === user.ID && p.ID === selectedId && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(p.ID);
                      }}
                    >
                      Edit
                    </button>
                    <DeletePlaceButton
                      placeId={p.ID}
                      user={user}
                      onDeleted={handlePlaceDeleted}
                    />
                  </>
                )}
              </>
            )}
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
        <FlyTo place={places.find((p) => p.ID === selectedId)} />
        {places.map((p) => (
          <CircleMarker
            key={p.ID}
            center={[p.Latitude, p.Longitude]}
            radius={p.ID === selectedId ? 14 : 8}
            pathOptions={{ color: p.ID === selectedId ? '#e11d48' : '#2563eb' }}
            eventHandlers={{ click: () => handleSelect(p.ID) }}
          >
            <Popup>{p.Name}</Popup>
          </CircleMarker>
        ))}

        {selectedCoords && (
          <Marker position={[selectedCoords.lat, selectedCoords.lng]}>
            <Popup>New place ({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)})</Popup>
          </Marker>
        )}
      </MapContainer>
    </>
  );
};

export default App;
