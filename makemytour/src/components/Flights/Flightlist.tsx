import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import SearchFilters, { Filters } from "../SearchFilters";

const FlightList = ({ onSelect }: any) => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    airline: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    maxStops: '',
    amenities: [],
  });

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        if (filters.airline) queryParams.append('airline', filters.airline);
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.minPrice !== '') queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== '') queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.minRating !== '') queryParams.append('minRating', filters.minRating.toString());
        if (filters.maxStops !== '') queryParams.append('maxStops', filters.maxStops.toString());
        if (filters.amenities.length > 0) queryParams.append('amenities', filters.amenities.join(','));

        const res = await fetch(`/api/flights?${queryParams.toString()}`);
        const data = await res.json();
        setFlights(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [filters]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <SearchFilters onFilterChange={setFilters} />
      <h3 className="text-lg font-semibold mb-2 mt-4">Flight List</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flight Name</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Stops</TableHead>
            <TableHead>Amenities</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flights.length > 0 ? (
            flights.map((flight: any) => (
              <TableRow key={flight.id}>
                <TableCell>{flight.flightName}</TableCell>
                <TableCell>{flight.from}</TableCell>
                <TableCell>{flight.to}</TableCell>
                <TableCell>${flight.price}</TableCell>
                <TableCell>{flight.rating}</TableCell>
                <TableCell>{flight.stops}</TableCell>
                <TableCell>{flight.amenities.join(', ')}</TableCell>
                <TableCell>
                  <Button onClick={() => onSelect(flight)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8}>No data</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FlightList;
