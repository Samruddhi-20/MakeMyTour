export interface BookingData {
  id: string;
  userId: string;
  amountSpent: number; // in INR
  bookingDate: string; // ISO string
}

export interface LoyaltyPoint {
  points: number;
  earnedDate: string; // ISO string
  expiryDate: string; // ISO string
  bookingId: string;
  redeemed: boolean;
}

export type TierLevel = 'Silver' | 'Gold' | 'Platinum';

export interface Tier {
  level: TierLevel;
  threshold: number; // points required to reach this tier
  benefits: string[];
}

export interface UserLoyalty {
  userId: string;
  pointsBalance: number;
  pointsHistory: LoyaltyPoint[];
  currentTier: TierLevel;
  tierProgress: number; // percentage progress to next tier
  pointsExpiryReminder: string; // message or date string for UI reminder
}
