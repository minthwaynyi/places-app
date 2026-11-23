import type { User } from '../types';

type DeletePlaceButtonProps = {
  placeId: number;
  user: User;
  onDeleted: (id: number) => void;
};

export const DeletePlaceButton = ({
  placeId,
  user,
  onDeleted,
}: DeletePlaceButtonProps) => {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this place?')) return;

    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/places/${placeId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.Token}` },
      }
    );

    if (!response.ok) {
      alert('Delete failed');
      return;
    }

    onDeleted(placeId);
  };

  return (
    <button type="button" onClick={handleClick}>
      Delete
    </button>
  );
};
