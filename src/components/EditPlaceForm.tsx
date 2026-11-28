import { useState } from 'react';
import type { Place, User } from '../types';

type EditPlaceFormProps = {
  place: Place;
  user: User;
  onSaved: (id: number, name: string) => void;
  onCancel: () => void;
};

export const EditPlaceForm = ({
  place,
  user,
  onSaved,
  onCancel,
}: EditPlaceFormProps) => {
  const [name, setName] = useState(place.Name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/places/${place.ID}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.Token}`,
        },
        body: JSON.stringify({
          Name: name,
          UserID: place.UserID,
          Latitude: place.Latitude,
          Longitude: place.Longitude,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Update failed:', response.status, text);
      alert(`Update failed: ${text}`);
      return;
    }

    onSaved(place.ID, name);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline' }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} required />
      <button type="submit">Save</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};
