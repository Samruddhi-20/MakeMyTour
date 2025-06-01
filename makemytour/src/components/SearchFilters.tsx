import React, { useState, useEffect } from 'react';
import SearchAutocomplete from './SearchAutocomplete';

interface SearchFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export interface Filters {
  airline: string;
  location: string;
  minPrice: number | '';
  maxPrice: number | '';
  minRating: number | '';
  maxStops: number | '';
  amenities: string[];
}

const amenitiesOptions = ['WiFi', 'In-flight Entertainment', 'Pool', 'Gym', 'Spa'];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<Filters>({
    airline: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    maxStops: '',
    amenities: [],
  });

  const locationSuggestions = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Miami',
    'San Francisco',
    'Seattle',
    'Denver',
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleAmenityChange = (amenity: string) => {
    setFilters((prev) => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <div>
        <label className="block font-semibold mb-1">Airline</label>
        <input
          type="text"
          value={filters.airline}
          onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
          className="w-full border border-gray-300 rounded p-2"
          placeholder="Enter airline"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Location</label>
        <SearchAutocomplete
          suggestions={locationSuggestions}
          value={filters.location}
          onChange={(value) => setFilters({ ...filters, location: value })}
          placeholder="Enter location"
        />
      </div>

      <div className="flex space-x-4">
        <div>
          <label className="block font-semibold mb-1">Min Price</label>
          <input
            type="number"
            min={0}
            value={filters.minPrice}
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Min price"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Max Price</label>
          <input
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Max price"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <div>
          <label className="block font-semibold mb-1">Min Rating</label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={filters.minRating}
            onChange={(e) =>
              setFilters({ ...filters, minRating: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Min rating"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Max Stops</label>
          <input
            type="number"
            min={0}
            value={filters.maxStops}
            onChange={(e) =>
              setFilters({ ...filters, maxStops: e.target.value === '' ? '' : Number(e.target.value) })
            }
            className="w-full border border-gray-300 rounded p-2"
            placeholder="Max stops"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-1">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {amenitiesOptions.map((amenity) => (
            <label key={amenity} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={() => handleAmenityChange(amenity)}
                className="form-checkbox"
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
