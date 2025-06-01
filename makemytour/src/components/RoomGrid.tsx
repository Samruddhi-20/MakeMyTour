import React, { useEffect, useState } from 'react';
import { useSelection } from '@/store/SelectionContext';

interface Room {
  id: string;
  type: string;
  photos: string[];
  pricePerNight: number;
  status: 'available' | 'booked';
  description: string;
  preview3D?: string;
}

const RoomGrid: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const { selectedRooms, selectRoom, deselectRoom } = useSelection();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms');
        const data: Room[] = await res.json();
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms', error);
      }
    };
    fetchRooms();
  }, []);

  const toggleRoomSelection = (room: Room) => {
    if (room.status === 'booked') return;
    if (selectedRooms.includes(room.id)) {
      deselectRoom(room.id);
    } else {
      selectRoom(room.id);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => {
        const isSelected = selectedRooms.includes(room.id);
        const borderColor = isSelected ? 'border-blue-600' : 'border-gray-300';
        const opacity = room.status === 'booked' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

        return (
          <div
            key={room.id}
            className={`border rounded-lg p-4 flex flex-col ${borderColor} ${opacity} transition-shadow hover:shadow-lg`}
            onClick={() => toggleRoomSelection(room)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleRoomSelection(room);
              }
            }}
            aria-pressed={isSelected}
            aria-label={`Select room ${room.type}, price $${room.pricePerNight}`}
          >
            <div className="h-48 w-full mb-4 overflow-hidden rounded-md">
              <img
                src={room.photos[0]}
                alt={room.type}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold mb-1">{room.type}</h3>
            <p className="text-sm text-gray-600 mb-2">{room.description}</p>
            <div className="mt-auto flex justify-between items-center">
              <span className="font-bold text-blue-600">$ {room.pricePerNight}</span>
              {room.status === 'booked' && (
                <span className="text-red-600 font-semibold">Booked</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoomGrid;
