import type { NextApiRequest, NextApiResponse } from 'next';
import {
  TravelBundle,
  FlightOption,
  HotelOption,
  TourGuideOption,
  UserSelection,
  DiscountDetails,
} from '@/types/bundles';

// Mock data for flights, hotels, tour guides (simplified for demo)
const flights: FlightOption[] = [
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
];

const hotels: HotelOption[] = [
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
];

const tourGuides: TourGuideOption[] = [
  {
    id: '1',
    name: 'John Doe',
    language: ['English', 'Spanish'],
    pricePerDay: 100,
    rating: 4.7,
    availableDates: ['2024-07-01', '2024-07-02', '2024-07-03'],
    description: 'Experienced tour guide for city tours.',
  },
  {
    id: '2',
    name: 'Jane Smith',
    language: ['English', 'French'],
    pricePerDay: 120,
    rating: 4.9,
    availableDates: ['2024-07-01', '2024-07-04', '2024-07-05'],
    description: 'Specializes in historical tours.',
  },
];

// Pre-built bundles with 10-15% discount
const bundles: TravelBundle[] = [
  {
    id: 'bundle1',
    name: 'NYC Explorer',
    description: 'Flight + Hotel + Tour Guide in New York',
    flights: [flights[0]],
    hotels: [hotels[0]],
    tourGuides: [tourGuides[0]],
    basePrice: flights[0].price + hotels[0].pricePerNight + tourGuides[0].pricePerDay,
    discountPercent: 15,
  },
  {
    id: 'bundle2',
    name: 'Miami Getaway',
    description: 'Flight + Hotel + Tour Guide in Miami',
    flights: [flights[1]],
    hotels: [hotels[1]],
    tourGuides: [tourGuides[1]],
    basePrice: flights[1].price + hotels[1].pricePerNight + tourGuides[1].pricePerDay,
    discountPercent: 10,
  },
];

// Helper to calculate discounts and final price
function calculateDiscounts(
  basePrice: number,
  travelers: number,
  bundleDiscountPercent: number
): DiscountDetails {
  const groupDiscountPercent = travelers >= 3 ? 5 : 0; // 5% group discount for 3+ travelers
  const totalDiscountPercent = bundleDiscountPercent + groupDiscountPercent;
  const totalDiscountAmount = (basePrice * totalDiscountPercent) / 100;
  const finalPrice = basePrice - totalDiscountAmount;
  return {
    bundleDiscountPercent,
    groupDiscountPercent,
    totalDiscountAmount,
    finalPrice,
  };
}

// Sanitize string input
function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[^\w\s-]/gi, '').trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Return all bundles with discounts applied
      const response = bundles.map(bundle => {
        const discountDetails = calculateDiscounts(
          bundle.basePrice,
          1,
          bundle.discountPercent
        );
        return { ...bundle, discountDetails };
      });
      res.status(200).json(response);
    } else if (req.method === 'POST') {
      // Process customization and calculate final price
      const { flightId, hotelId, tourGuideId, travelers } = req.body as UserSelection;

      if (
        !flightId ||
        !hotelId ||
        !tourGuideId ||
        !travelers ||
        typeof travelers !== 'number' ||
        travelers < 1
      ) {
        res.status(400).json({ error: 'Invalid input' });
        return;
      }

      const selectedFlight = flights.find(f => f.id === flightId);
      const selectedHotel = hotels.find(h => h.id === hotelId);
      const selectedTourGuide = tourGuides.find(t => t.id === tourGuideId);

      if (!selectedFlight || !selectedHotel || !selectedTourGuide) {
        res.status(400).json({ error: 'Selected options not found' });
        return;
      }

      const basePrice =
        selectedFlight.price +
        selectedHotel.pricePerNight +
        selectedTourGuide.pricePerDay;

      const discountDetails = calculateDiscounts(
        basePrice,
        travelers,
        10 // base bundle discount 10% for customized bundles
      );

      res.status(200).json({
        selectedFlight,
        selectedHotel,
        selectedTourGuide,
        travelers,
        discountDetails,
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
