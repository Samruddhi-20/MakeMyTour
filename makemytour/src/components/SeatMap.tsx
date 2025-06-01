import React, { useEffect, useState } from 'react';
import { useSelection } from '@/store/SelectionContext';

interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'booked' | 'premium';
  price: number;
  type: 'standard' | 'premium';
}

const seatColors = {
  available: 'bg-green-500 hover:bg-green-600',
  booked: 'bg-gray-400 cursor-not-allowed',
  premium: 'bg-yellow-400 hover:bg-yellow-500',
  selected: 'bg-blue-600',
};

const SeatMap: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const { selectedSeats, selectSeat, deselectSeat } = useSelection();

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await fetch('/api/seats');
        const data: Seat[] = await res.json();
        setSeats(data);
      } catch (error) {
        console.error('Failed to fetch seats', error);
      }
    };
    fetchSeats();
  }, []);

  const toggleSeatSelection = (seat: Seat) => {
    if (seat.status === 'booked') return;
    if (selectedSeats.includes(seat.id)) {
      deselectSeat(seat.id);
    } else {
      selectSeat(seat.id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-max p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-6 gap-2">
          {seats.map((seat) => {
            const isSelected = selectedSeats.includes(seat.id);
            const seatClass = seat.status === 'booked'
              ? seatColors.booked
              : isSelected
              ? seatColors.selected
              : seat.status === 'premium'
              ? seatColors.premium
              : seatColors.available;

            return (
              <button
                key={seat.id}
                className={`w-10 h-10 rounded-md text-white font-semibold flex items-center justify-center ${seatClass} transition-colors`}
                onClick={() => toggleSeatSelection(seat)}
                disabled={seat.status === 'booked'}
                title={`Seat ${seat.id} - ${seat.type} - $${seat.price} - ${seat.status}`}
                aria-pressed={isSelected}
                aria-label={`Select seat ${seat.id}, ${seat.type}, price $${seat.price}`}
              >
                {seat.id}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-yellow-400 rounded"></div>
            <span>Premium</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-gray-400 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
