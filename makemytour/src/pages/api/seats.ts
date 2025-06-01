import type { NextApiRequest, NextApiResponse } from 'next';

interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'booked' | 'premium';
  price: number;
  type: 'standard' | 'premium';
}

let seats: Seat[] = [];

// Initialize mock seat data: 10 rows, 6 seats per row (A-F)
const rows = 10;
const seatsPerRow = 6;
const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

function generateSeats() {
  const newSeats: Seat[] = [];
  for (let row = 1; row <= rows; row++) {
    for (let i = 0; i < seatsPerRow; i++) {
      const seatId = `${row}${seatLetters[i]}`;
      const isPremium = row <= 2; // First 2 rows are premium
      newSeats.push({
        id: seatId,
        row,
        number: i + 1,
        status: Math.random() < 0.2 ? 'booked' : 'available', // 20% booked randomly
        price: isPremium ? 150 : 100,
        type: isPremium ? 'premium' : 'standard',
      });
    }
  }
  return newSeats;
}

if (seats.length === 0) {
  seats = generateSeats();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return seat availability and pricing
    res.status(200).json(seats);
  } else if (req.method === 'POST') {
    // Simulate booking seat(s)
    const { seatIds } = req.body;
    if (!Array.isArray(seatIds)) {
      res.status(400).json({ error: 'seatIds must be an array' });
      return;
    }
    // Update seat status to booked if available
    const updatedSeats: Seat[] = [];
    for (const seatId of seatIds) {
      const seat = seats.find(s => s.id === seatId);
      if (!seat) {
        res.status(404).json({ error: `Seat ${seatId} not found` });
        return;
      }
      if (seat.status === 'booked') {
        res.status(409).json({ error: `Seat ${seatId} already booked` });
        return;
      }
      seat.status = 'booked';
      updatedSeats.push(seat);
    }
    res.status(200).json({ message: 'Seats booked successfully', seats: updatedSeats });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
