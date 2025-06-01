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

const HotelList = ({ onSelect }: any) => {
  const [hotels, setHotels] = useState<any[]>([]);
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
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        if (filters.location) queryParams.append('location', filters.location);
        if (filters.minPrice !== '') queryParams.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== '') queryParams.append('maxPrice', filters.maxPrice.toString());
        if (filters.minRating !== '') queryParams.append('minRating', filters.minRating.toString());
        if (filters.amenities.length > 0) queryParams.append('amenities', filters.amenities.join(','));

        const res = await fetch(`/api/hotels?${queryParams.toString()}`);
        const data = await res.json();
        setHotels(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [filters]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <SearchFilters onFilterChange={setFilters} />
      <h3 className="text-lg font-semibold mb-2 mt-4">Hotel List</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hotel Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Price/Night</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Amenities</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels.length > 0 ? (
            hotels.map((hotel: any) => (
              <TableRow key={hotel.id}>
                <TableCell>{hotel.hotelName}</TableCell>
                <TableCell>{hotel.location}</TableCell>
                <TableCell>${hotel.pricePerNight}</TableCell>
                <TableCell>{hotel.rating}</TableCell>
                <TableCell>{hotel.amenities.join(', ')}</TableCell>
                <TableCell>
                  <Button onClick={() => onSelect(hotel)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>No data</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HotelList;
