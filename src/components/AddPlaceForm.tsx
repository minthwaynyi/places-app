import { useState } from 'react';
import type { Place, User } from '../types';

type AddPlaceFormProps = {
  user: User;
  selectedCoords: { lat: number; lng: number } | null;
  onPlaceAdded: (newPlace: Place) => void;
  onLocationFound: (coords: { lat: number; lng: number }) => void;
};

export const AddPlaceForm = ({
  user,
  selectedCoords,
  onPlaceAdded,
  onLocationFound,
}: AddPlaceFormProps) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(() =>
    selectedCoords ? selectedCoords.lat.toFixed(6) : ''
  );
  const [longitude, setLongitude] = useState(() =>
    selectedCoords ? selectedCoords.lng.toFixed(6) : ''
  );
  const [status, setStatus] = useState('');

  // Convert street address to coordinates using OpenStreetMap Nominatim
  const handleAddressSearch = async () => {
    if (!address.trim()) return;
    setStatus('Searching address...');

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      address
    )}`;
    const response = await fetch(url);
    const results = await response.json();

    if (!results.length) {
      setStatus('Address not found.');
      return;
    }

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);

    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    onLocationFound({ lat, lng });
    setStatus('Address found! Enter a place name and click Add Place.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');

    if (!name.trim()) {
      setStatus('Place name is required.');
      return;
    }

    if (!user.Token) {
      setStatus('Missing authentication token. Please log in again.');
      return;
    }

    const response = await fetch(import.meta.env.VITE_SERVER_URL + '/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.Token}`,
      },
      body: JSON.stringify({
        Name: name.trim(),
        UserID: user.ID,
        Latitude: parseFloat(latitude),
        Longitude: parseFloat(longitude),
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        setStatus('Unauthorized. Your session may have expired; please log in again.');
      } else {
        setStatus('Failed to add place. Check your inputs.');
      }
      return;
    }

    const createdPlace: Place = await response.json();
    onPlaceAdded(createdPlace);
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setStatus('Place added!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add a New Place</h3>
      <p>Click on the map, search an address, or enter coordinates manually.</p>

      <div>
        <label>
          Street Address (optional lookup):{' '}
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Torikatu 1, Joensuu"
          />
        </label>{' '}
        <button type="button" onClick={handleAddressSearch}>
          Find Address
        </button>
      </div>

      <div>
        <label>
          Place Name:{' '}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Latitude:{' '}
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
          />
        </label>
      </div>

      <div>
        <label>
          Longitude:{' '}
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
          />
        </label>
      </div>

      <button type="submit">Add Place</button>
      {status && <p>{status}</p>}
    </form>
  );
};