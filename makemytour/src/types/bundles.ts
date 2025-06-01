export interface FlightOption {
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

export interface HotelOption {
  id: string;
  hotelName: string;
  location: string;
  pricePerNight: number;
  availableRooms: number;
  rating: number;
  amenities: string[];
}

export interface TourGuideOption {
  id: string;
  name: string;
  language: string[];
  pricePerDay: number;
  rating: number;
  availableDates: string[]; // ISO date strings
  description: string;
}

export interface TravelBundle {
  id: string;
  name: string;
  description: string;
  flights: FlightOption[];
  hotels: HotelOption[];
  tourGuides: TourGuideOption[];
  basePrice: number;
  discountPercent: number; // 10-15%
}

export interface UserSelection {
  flightId: string;
  hotelId: string;
  tourGuideId: string;
  travelers: number;
}

export interface DiscountDetails {
  bundleDiscountPercent: number;
  groupDiscountPercent: number;
  totalDiscountAmount: number;
  finalPrice: number;
}
