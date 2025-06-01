import type { NextApiRequest, NextApiResponse } from 'next';

interface PricePoint {
  timestamp: number;
  price: number;
}

interface FlightPricing {
  id: string;
  basePrice: number;
  demandFactor: number; // 0 to 1
  seasonalFactor: number; // 0 to 1
  customRulesFactor: number; // e.g. 0.2 for +20%
  priceHistory: PricePoint[];
  priceFreezeUntil?: number; // timestamp until price is frozen
}

const flightsPricing: FlightPricing[] = [
  {
    id: '1',
    basePrice: 300,
    demandFactor: 0.5,
    seasonalFactor: 0.3,
    customRulesFactor: 0.2,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 280 },
      { timestamp: Date.now() - 86400000 * 2, price: 290 },
      { timestamp: Date.now() - 86400000, price: 310 },
      { timestamp: Date.now(), price: 320 },
    ],
  },
  {
    id: '2',
    basePrice: 200,
    demandFactor: 0.7,
    seasonalFactor: 0.1,
    customRulesFactor: 0.15,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 190 },
      { timestamp: Date.now() - 86400000 * 2, price: 195 },
      { timestamp: Date.now() - 86400000, price: 210 },
      { timestamp: Date.now(), price: 220 },
    ],
  },
  {
    id: '3',
    basePrice: 150,
    demandFactor: 0.3,
    seasonalFactor: 0.2,
    customRulesFactor: 0.1,
    priceHistory: [
      { timestamp: Date.now() - 86400000 * 3, price: 140 },
      { timestamp: Date.now() - 86400000 * 2, price: 145 },
      { timestamp: Date.now() - 86400000, price: 150 },
      { timestamp: Date.now(), price: 155 },
    ],
  },
];

// Helper to calculate dynamic price
function calculatePrice(fp: FlightPricing): number {
  const base = fp.basePrice;
  const demand = 1 + fp.demandFactor; // e.g. 1.5 if demandFactor=0.5
  const seasonal = 1 + fp.seasonalFactor;
  const custom = 1 + fp.customRulesFactor;
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
      res.status(400).json({ error: 'Invalid or missing flight id' });
      return;
    }

    const flightPricing = flightsPricing.find(fp => fp.id === id);
    if (!flightPricing) {
      res.status(404).json({ error: 'Flight not found' });
      return;
    }

    // Handle price freeze request
    if (freeze === 'true') {
      const now = Date.now();
      flightPricing.priceFreezeUntil = now + 24 * 60 * 60 * 1000; // 24 hours
      res.status(200).json({ message: 'Price frozen for 24 hours' });
      return;
    }

    // Check if price is frozen
    const now = Date.now();
    let currentPrice: number;
    if (flightPricing.priceFreezeUntil && flightPricing.priceFreezeUntil > now) {
      // Use last price in priceHistory as frozen price
      currentPrice = flightPricing.priceHistory[flightPricing.priceHistory.length - 1].price;
    } else {
      currentPrice = calculatePrice(flightPricing);
      // Update price history with new price point
      flightPricing.priceHistory.push({ timestamp: now, price: currentPrice });
      // Keep only last 30 price points
      if (flightPricing.priceHistory.length > 30) {
        flightPricing.priceHistory.shift();
      }
      // Clear freeze if expired
      if (flightPricing.priceFreezeUntil && flightPricing.priceFreezeUntil <= now) {
        flightPricing.priceFreezeUntil = undefined;
      }
    }

    res.status(200).json({
      id: flightPricing.id,
      currentPrice,
      priceHistory: flightPricing.priceHistory,
      priceFreezeUntil: flightPricing.priceFreezeUntil,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
