import type { NextApiRequest, NextApiResponse } from 'next';

interface Flight {
  id: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  rating: number;
  stops: number;
  amenities: string[];
}

const flights: Flight[] = [
  {
    id: '1',
    flightName: 'Airline A',
    from: 'New York',
    to: 'Los Angeles',
    departureTime: '2024-07-01T08:00:00Z',
    arrivalTime: '2024-07-01T11:00:00Z',
    price: 300,
    availableSeats: 50,
    rating: 4.5,
    stops: 0,
    amenities: ['WiFi', 'In-flight Entertainment'],
  },
  {
    id: '2',
    flightName: 'Airline B',
    from: 'Chicago',
    to: 'Miami',
    departureTime: '2024-07-02T09:00:00Z',
    arrivalTime: '2024-07-02T13:00:00Z',
    price: 200,
    availableSeats: 30,
    rating: 4.0,
    stops: 1,
    amenities: ['WiFi'],
  },
  {
    id: '3',
    flightName: 'Airline C',
    from: 'San Francisco',
    to: 'Seattle',
    departureTime: '2024-07-03T07:00:00Z',
    arrivalTime: '2024-07-03T09:00:00Z',
    price: 150,
    availableSeats: 20,
    rating: 3.5,
    stops: 0,
    amenities: ['In-flight Entertainment'],
  },
  // Add more mock flights as needed
];

function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[^\w\s-]/gi, '').trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      airline,
      location,
      minPrice,
      maxPrice,
      minRating,
      maxStops,
      amenities,
    } = req.query;

    let filteredFlights = flights;

    if (airline) {
      const airlineStr = sanitizeString(airline);
      filteredFlights = filteredFlights.filter(f =>
        f.flightName.toLowerCase().includes(airlineStr.toLowerCase())
      );
    }

    if (location) {
      const locationStr = sanitizeString(location);
      filteredFlights = filteredFlights.filter(f =>
        f.from.toLowerCase().includes(locationStr.toLowerCase()) ||
        f.to.toLowerCase().includes(locationStr.toLowerCase())
      );
    }

    if (minPrice) {
      const minP = Number(minPrice);
      if (!isNaN(minP)) {
        filteredFlights = filteredFlights.filter(f => f.price >= minP);
      }
    }

    if (maxPrice) {
      const maxP = Number(maxPrice);
      if (!isNaN(maxP)) {
        filteredFlights = filteredFlights.filter(f => f.price <= maxP);
      }
    }

    if (minRating) {
      const minR = Number(minRating);
      if (!isNaN(minR)) {
        filteredFlights = filteredFlights.filter(f => f.rating >= minR);
      }
    }

    if (maxStops) {
      const maxS = Number(maxStops);
      if (!isNaN(maxS)) {
        filteredFlights = filteredFlights.filter(f => f.stops <= maxS);
      }
    }

    if (amenities) {
      const amenitiesArr = Array.isArray(amenities)
        ? amenities
        : (amenities as string).split(',').map(a => a.trim().toLowerCase());
      filteredFlights = filteredFlights.filter(f =>
        amenitiesArr.every(a =>
          f.amenities.map(am => am.toLowerCase()).includes(a)
        )
      );
    }

    res.status(200).json(filteredFlights);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
