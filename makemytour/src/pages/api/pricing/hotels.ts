import type { NextApiRequest, NextApiResponse } from 'next';

interface PricePoint {
  timestamp: number;
  price: number;
}

interface HotelPricing {
  id: string;
  basePrice: number;
  demandFactor: number; // 0 to 1
  seasonalFactor: number; // 0 to 1
  customRulesFactor: number; // e.g. 0.2 for +20%
  priceHistory: PricePoint[];
  priceFreezeUntil?: number; // timestamp until price is frozen
}

const hotelsPricing: HotelPricing[] = [
  {
    id: '1',
    basePrice: 150,
    demandFactor: 0.6,
    seasonalFactor: 0.4,
    customRulesFactor: 0.25,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 140 },
      { timestamp: Date.now() - 86400000 * 2, price: 145 },
      { timestamp: Date.now() - 86400000, price: 155 },
      { timestamp: Date.now(), price: 160 },
    ],
  },
  {
    id: '2',
    basePrice: 200,
    demandFactor: 0.5,
    seasonalFactor: 0.3,
    customRulesFactor: 0.2,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 190 },
      { timestamp: Date.now() - 86400000 * 2, price: 195 },
      { timestamp: Date.now() - 86400000, price: 210 },
      { timestamp: Date.now(), price: 215 },
    ],
  },
  {
    id: '3',
    basePrice: 120,
    demandFactor: 0.4,
    seasonalFactor: 0.2,
    customRulesFactor: 0.15,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 110 },
      { timestamp: Date.now() - 86400000 * 2, price: 115 },
      { timestamp: Date.now() - 86400000, price: 120 },
      { timestamp: Date.now(), price: 125 },
    ],
  },
];

// Helper to calculate dynamic price
function calculatePrice(hp: HotelPricing): number {
  const base = hp.basePrice;
  const demand = 1 + hp.demandFactor;
  const seasonal = 1 + hp.seasonalFactor;
  const custom = 1 + hp.customRulesFactor;
  return Math.round(base * demand * seasonal * custom);
}

// Sanitize input to prevent XSS and injection
function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[^\w\s-]/gi, '').trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, freeze } = req.query;

    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid or missing hotel id' });
      return;
    }

    const hotelPricing = hotelsPricing.find(hp => hp.id === id);
    if (!hotelPricing) {
      res.status(404).json({ error: 'Hotel not found' });
      return;
    }

    // Handle price freeze request
    if (freeze === 'true') {
      const now = Date.now();
      hotelPricing.priceFreezeUntil = now + 24 * 60 * 60 * 1000; // 24 hours
      res.status(200).json({ message: 'Price frozen for 24 hours' });
      return;
    }

    // Check if price is frozen
    const now = Date.now();
    let currentPrice: number;
    if (hotelPricing.priceFreezeUntil && hotelPricing.priceFreezeUntil > now) {
      currentPrice = hotelPricing.priceHistory[hotelPricing.priceHistory.length - 1].price;
    } else {
      currentPrice = calculatePrice(hotelPricing);
      hotelPricing.priceHistory.push({ timestamp: now, price: currentPrice });
      if (hotelPricing.priceHistory.length > 30) {
        hotelPricing.priceHistory.shift();
      }
      if (hotelPricing.priceFreezeUntil && hotelPricing.priceFreezeUntil <= now) {
        hotelPricing.priceFreezeUntil = undefined;
      }
    }

    res.status(200).json({
      id: hotelPricing.id,
      currentPrice,
      priceHistory: hotelPricing.priceHistory,
      priceFreezeUntil: hotelPricing.priceFreezeUntil,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
