import type { NextApiRequest, NextApiResponse } from 'next';
import { BookingData, UserLoyalty, Tier, TierLevel, LoyaltyPoint } from '../../types/loyalty';

// Mock booking data
const mockBookings: BookingData[] = [
  {
    id: 'b1',
    userId: 'user1',
    amountSpent: 4500,
    bookingDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
  },
  {
    id: 'b2',
    userId: 'user1',
    amountSpent: 12000,
    bookingDate: new Date(new Date().setMonth(new Date().getMonth() - 7)).toISOString(),
  },
  {
    id: 'b3',
    userId: 'user1',
    amountSpent: 3000,
    bookingDate: new Date().toISOString(),
  },
];

// Tier definitions
const tiers: Tier[] = [
  { level: 'Silver', threshold: 0, benefits: ['Basic support', '5% discount on bookings'] },
  { level: 'Gold', threshold: 500, benefits: ['Priority support', '10% discount on bookings'] },
  { level: 'Platinum', threshold: 1000, benefits: ['24/7 support', '15% discount on bookings', 'Free upgrades'] },
];

// Constants
const POINTS_PER_1000 = 100;
const POINTS_EXPIRY_MONTHS = 6;

function calculatePoints(amount: number): number {
  return Math.floor(amount / 1000) * POINTS_PER_1000;
}

function getTier(points: number): TierLevel {
  if (points >= tiers[2].threshold) return 'Platinum';
  if (points >= tiers[1].threshold) return 'Gold';
  return 'Silver';
}

function getNextTier(currentTier: TierLevel): Tier | null {
  const index = tiers.findIndex(t => t.level === currentTier);
  if (index < 0 || index === tiers.length - 1) return null;
  return tiers[index + 1];
}

function calculateTierProgress(points: number, currentTier: TierLevel): number {
  const currentTierIndex = tiers.findIndex(t => t.level === currentTier);
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return 100;
  const range = nextTier.threshold - tiers[currentTierIndex].threshold;
  const progress = ((points - tiers[currentTierIndex].threshold) / range) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

function filterExpiredPoints(pointsHistory: LoyaltyPoint[]): LoyaltyPoint[] {
  const now = new Date();
  return pointsHistory.filter(p => new Date(p.expiryDate) > now && !p.redeemed);
}

function calculatePointsBalance(pointsHistory: LoyaltyPoint[]): number {
  return pointsHistory.reduce((acc, p) => acc + (p.redeemed ? 0 : p.points), 0);
}

function generateExpiryReminder(pointsHistory: LoyaltyPoint[]): string {
  const now = new Date();
  const soonToExpire = pointsHistory.filter(p => {
    const expiry = new Date(p.expiryDate);
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 30 && !p.redeemed;
  });
  if (soonToExpire.length > 0) {
    return `You have ${soonToExpire.length} point entries expiring within 30 days. Redeem soon!`;
  }
  return '';
}

// Simulated user loyalty data store (in-memory)
const userLoyaltyData: Record<string, UserLoyalty> = {};

// Initialize or update user loyalty data based on bookings
function updateUserLoyalty(userId: string): UserLoyalty {
  // Filter bookings for user
  const userBookings = mockBookings.filter(b => b.userId === userId);

  // Build points history from bookings
  let pointsHistory: LoyaltyPoint[] = [];

  userBookings.forEach(booking => {
    const points = calculatePoints(booking.amountSpent);
    const earnedDate = new Date(booking.bookingDate);
    const expiryDate = new Date(earnedDate);
    expiryDate.setMonth(expiryDate.getMonth() + POINTS_EXPIRY_MONTHS);

    pointsHistory.push({
      points,
      earnedDate: earnedDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      bookingId: booking.id,
      redeemed: false,
    });
  });

  // Filter out expired points
  pointsHistory = filterExpiredPoints(pointsHistory);

  const pointsBalance = calculatePointsBalance(pointsHistory);
  const currentTier = getTier(pointsBalance);
  const tierProgress = calculateTierProgress(pointsBalance, currentTier);
  const pointsExpiryReminder = generateExpiryReminder(pointsHistory);

  const userLoyalty: UserLoyalty = {
    userId,
    pointsBalance,
    pointsHistory,
    currentTier,
    tierProgress,
    pointsExpiryReminder,
  };

  userLoyaltyData[userId] = userLoyalty;
  return userLoyalty;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({ error: 'Missing userId query parameter' });
    return;
  }

  switch (method) {
    case 'GET': {
      // Return user loyalty data
      const userLoyalty = userLoyaltyData[userId] || updateUserLoyalty(userId);
      res.status(200).json(userLoyalty);
      break;
    }
    case 'POST': {
      // Redeem points
      const { pointsToRedeem } = req.body;
      if (typeof pointsToRedeem !== 'number' || pointsToRedeem <= 0) {
        res.status(400).json({ error: 'Invalid pointsToRedeem in request body' });
        return;
      }
      let userLoyalty = userLoyaltyData[userId];
      if (!userLoyalty) {
        userLoyalty = updateUserLoyalty(userId);
      }
      if (pointsToRedeem > userLoyalty.pointsBalance) {
        res.status(400).json({ error: 'Insufficient points balance' });
        return;
      }
      // Redeem points from oldest points first
      let pointsLeftToRedeem = pointsToRedeem;
      for (const pointEntry of userLoyalty.pointsHistory) {
        if (pointEntry.redeemed) continue;
        if (pointsLeftToRedeem <= 0) break;
        if (pointEntry.points <= pointsLeftToRedeem) {
          pointsLeftToRedeem -= pointEntry.points;
          pointEntry.redeemed = true;
        } else {
          pointEntry.points -= pointsLeftToRedeem;
          pointsLeftToRedeem = 0;
        }
      }
      userLoyalty.pointsBalance -= pointsToRedeem;
      userLoyalty.currentTier = getTier(userLoyalty.pointsBalance);
      userLoyalty.tierProgress = calculateTierProgress(userLoyalty.pointsBalance, userLoyalty.currentTier);
      userLoyalty.pointsExpiryReminder = generateExpiryReminder(userLoyalty.pointsHistory);

      res.status(200).json(userLoyalty);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
