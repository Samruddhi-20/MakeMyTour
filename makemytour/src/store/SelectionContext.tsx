import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface SelectionContextType {
  selectedSeats: string[];
  selectedRooms: string[];
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  selectRoom: (roomId: string) => void;
  deselectRoom: (roomId: string) => void;
  clearSelection: () => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('selectedSeats');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [selectedRooms, setSelectedRooms] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('selectedRooms');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
  }, [selectedSeats]);

  useEffect(() => {
    sessionStorage.setItem('selectedRooms', JSON.stringify(selectedRooms));
  }, [selectedRooms]);

  const selectSeat = (seatId: string) => {
    setSelectedSeats(prev => (prev.includes(seatId) ? prev : [...prev, seatId]));
  };

  const deselectSeat = (seatId: string) => {
    setSelectedSeats(prev => prev.filter(id => id !== seatId));
  };

  const selectRoom = (roomId: string) => {
    setSelectedRooms(prev => (prev.includes(roomId) ? prev : [...prev, roomId]));
  };

  const deselectRoom = (roomId: string) => {
    setSelectedRooms(prev => prev.filter(id => id !== roomId));
  };

  const clearSelection = () => {
    setSelectedSeats([]);
    setSelectedRooms([]);
  };

  return (
    <SelectionContext.Provider
      value={{
        selectedSeats,
        selectedRooms,
        selectSeat,
        deselectSeat,
        selectRoom,
        deselectRoom,
        clearSelection,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = (): SelectionContextType => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};
