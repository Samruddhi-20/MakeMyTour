import React, { useEffect, useState } from 'react';
import { FlightOption, HotelOption, TourGuideOption, UserSelection } from '@/types/bundles';
import BundleSummary from './BundleSummary';

const BundleBuilder: React.FC = () => {
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [tourGuides, setTourGuides] = useState<TourGuideOption[]>([]);
  const [selection, setSelection] = useState<UserSelection>({
    flightId: '',
    hotelId: '',
    tourGuideId: '',
    travelers: 1,
  });
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Fetch options from API
    const fetchOptions = async () => {
      try {
        const [flightsRes, hotelsRes, bundlesRes] = await Promise.all([
          fetch('/api/flights'),
          fetch('/api/hotels'),
          fetch('/api/bundles'),
        ]);
        const flightsData = await flightsRes.json();
        const hotelsData = await hotelsRes.json();
        const bundlesData = await bundlesRes.json();

        setFlights(flightsData);
        setHotels(hotelsData);
        // Extract tour guides from bundles mock data
        const tourGuidesData = bundlesData.flatMap((b: any) => b.tourGuides);
        setTourGuides(tourGuidesData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelection(prev => ({
      ...prev,
      [name]: name === 'travelers' ? Math.max(1, Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selection),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || 'Failed to fetch bundle summary');
        setSummaryData(null);
      } else {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (err) {
      setError('Failed to fetch bundle summary');
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Customize Your Travel Bundle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="flightId" className="block font-medium mb-1">Select Flight</label>
          <select
            id="flightId"
            name="flightId"
            value={selection.flightId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Select Flight --</option>
            {flights.map(flight => (
              <option key={flight.id} value={flight.id}>
                {flight.flightName} ({flight.from} → {flight.to}) - ${flight.price}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hotelId" className="block font-medium mb-1">Select Hotel</label>
          <select
            id="hotelId"
            name="hotelId"
            value={selection.hotelId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Select Hotel --</option>
            {hotels.map(hotel => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.hotelName} ({hotel.location}) - ${hotel.pricePerNight} per night
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tourGuideId" className="block font-medium mb-1">Select Tour Guide</label>
          <select
            id="tourGuideId"
            name="tourGuideId"
            value={selection.tourGuideId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">-- Select Tour Guide --</option>
            {tourGuides.map(guide => (
              <option key={guide.id} value={guide.id}>
                {guide.name} - ${guide.pricePerDay} per day
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="travelers" className="block font-medium mb-1">Number of Travelers</label>
          <input
            type="number"
            id="travelers"
            name="travelers"
            min={1}
            value={selection.travelers}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate Bundle'}
        </button>
      </form>
      {error && <p className="text-red-600 mt-4">{error}</p>}
      {summaryData && <BundleSummary summary={summaryData} />}
    </div>
  );
};

export default BundleBuilder;
