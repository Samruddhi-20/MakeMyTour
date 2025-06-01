import React, { useEffect, useState, useCallback } from 'react';
import PriceGraph from './PriceGraph';
import PriceFreezeButton from './PriceFreezeButton';

interface PricePoint {
  timestamp: number;
  price: number;
}

interface DynamicPriceCardProps {
  id: string;
  type: 'flight' | 'hotel';
}

const DynamicPriceCard: React.FC<DynamicPriceCardProps> = ({ id, type }) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [priceFreezeUntil, setPriceFreezeUntil] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceData = useCallback(async () => {
    try {
      const res = await fetch(`/api/pricing/${type}s?id=${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch price data');
      }
      const data = await res.json();
      setCurrentPrice(data.currentPrice);
      setPriceHistory(data.priceHistory);
      setPriceFreezeUntil(data.priceFreezeUntil);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching price data');
    }
  }, [id, type]);

  useEffect(() => {
    fetchPriceData();
    const interval = setInterval(fetchPriceData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchPriceData]);

  const handleFreezePrice = async () => {
    try {
      const res = await fetch(`/api/pricing/${type}s?id=${id}&freeze=true`);
      if (!res.ok) {
        throw new Error('Failed to freeze price');
      }
      await fetchPriceData();
    } catch (err: any) {
      setError(err.message || 'Error freezing price');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-md">
      <h3 className="text-xl font-semibold mb-2 capitalize">{type} Pricing</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="text-3xl font-bold mb-2">
        {currentPrice !== null ? `$ ${currentPrice.toLocaleString()}` : 'Loading...'}
      </div>
      <PriceFreezeButton
        isFrozen={!!priceFreezeUntil && priceFreezeUntil > Date.now()}
        freezeUntil={priceFreezeUntil}
        onFreeze={handleFreezePrice}
      />
      <div className="mt-4">
        <PriceGraph priceHistory={priceHistory} />
      </div>
    </div>
  );
};

export default DynamicPriceCard;
