import type { NextApiRequest, NextApiResponse } from 'next';

interface Hotel {
  id: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  rating: number;
  amenities: string[];
}

const hotels: Hotel[] = [
  {
    id: '1',
    hotelName: 'Hotel Sunshine',
    location: 'New York',
    pricePerNight: 150,
    availableRooms: 10,
    rating: 4.5,
    amenities: ['Pool', 'WiFi', 'Gym'],
  },
  {
    id: '2',
    hotelName: 'Ocean View Resort',
    location: 'Miami',
    pricePerNight: 200,
    availableRooms: 5,
    rating: 4.0,
    amenities: ['Pool', 'Spa', 'WiFi'],
  },
  {
    id: '3',
    hotelName: 'Mountain Lodge',
    location: 'Denver',
    pricePerNight: 120,
    availableRooms: 8,
    rating: 3.5,
    amenities: ['WiFi', 'Gym'],
  },
  // Add more mock hotels as needed
];

function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[^\w\s-]/gi, '').trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      minRating,
      amenities,
    } = req.query;

    let filteredHotels = hotels;

    if (location) {
      const locationStr = sanitizeString(location);
      filteredHotels = filteredHotels.filter(h =>
        h.location.toLowerCase().includes(locationStr.toLowerCase())
      );
    }

    if (minPrice) {
      const minP = Number(minPrice);
      if (!isNaN(minP)) {
        filteredHotels = filteredHotels.filter(h => h.pricePerNight >= minP);
      }
    }

    if (maxPrice) {
      const maxP = Number(maxPrice);
      if (!isNaN(maxP)) {
        filteredHotels = filteredHotels.filter(h => h.pricePerNight <= maxP);
      }
    }

    if (minRating) {
      const minR = Number(minRating);
      if (!isNaN(minR)) {
        filteredHotels = filteredHotels.filter(h => h.rating >= minR);
      }
    }

    if (amenities) {
      const amenitiesArr = Array.isArray(amenities)
        ? amenities
        : (amenities as string).split(',').map(a => a.trim().toLowerCase());
      filteredHotels = filteredHotels.filter(h =>
        amenitiesArr.every(a =>
          h.amenities.map(am => am.toLowerCase()).includes(a)
        )
      );
    }

    res.status(200).json(filteredHotels);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
