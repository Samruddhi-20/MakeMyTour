import type { NextApiRequest, NextApiResponse } from 'next';

interface Room {
  id: string;
  type: string;
  photos: string[];
  pricePerNight: number;
  status: 'available' | 'booked';
  description: string;
  preview3D?: string; // URL to image/video or undefined
}

let rooms: Room[] = [
  {
    id: '101',
    type: 'Standard Room',
    photos: [
      'https://images.unsplash.com/photo-1501117716987-c8e6a7a7a7a7?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800',
    ],
    pricePerNight: 100,
    status: 'available',
    description: 'A comfortable standard room with all basic amenities.',
    preview3D: undefined,
  },
  {
    id: '102',
    type: 'Deluxe Room',
    photos: [
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800',
    ],
    pricePerNight: 150,
    status: 'booked',
    description: 'Spacious deluxe room with premium facilities.',
    preview3D: 'https://example.com/3d-preview-deluxe.mp4',
  },
  {
    id: '103',
    type: 'Suite',
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1501183638714-1c7a1bfb0f4d?auto=format&fit=crop&w=800',
    ],
    pricePerNight: 250,
    status: 'available',
    description: 'Luxurious suite with separate living area and premium amenities.',
    preview3D: 'https://example.com/3d-preview-suite.mp4',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return room availability and pricing
    res.status(200).json(rooms);
  } else if (req.method === 'POST') {
    // Simulate booking room(s)
    const { roomIds } = req.body;
    if (!Array.isArray(roomIds)) {
      res.status(400).json({ error: 'roomIds must be an array' });
      return;
    }
    const updatedRooms: Room[] = [];
    for (const roomId of roomIds) {
      const room = rooms.find(r => r.id === roomId);
      if (!room) {
        res.status(404).json({ error: `Room ${roomId} not found` });
        return;
      }
      if (room.status === 'booked') {
        res.status(409).json({ error: `Room ${roomId} already booked` });
        return;
      }
      room.status = 'booked';
      updatedRooms.push(room);
    }
    res.status(200).json({ message: 'Rooms booked successfully', rooms: updatedRooms });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
