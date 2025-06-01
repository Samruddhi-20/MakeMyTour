import React, { useEffect, useState } from 'react';
import { UserLoyalty } from '../types/loyalty';
import TierProgressBar from './TierProgressBar';
import RedeemPointsModal from './RedeemPointsModal';

interface LoyaltyDashboardProps {
  userId: string;
}

const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({ userId }) => {
  const [loyaltyData, setLoyaltyData] = useState<UserLoyalty | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/loyalty?userId=${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch loyalty data');
      }
      const data: UserLoyalty = await res.json();
      setLoyaltyData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyaltyData();
  }, [userId]);

  const handleRedeem = async (pointsToRedeem: number) => {
    if (!loyaltyData) return;
    try {
      const res = await fetch('/api/loyalty?userId=' + userId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsToRedeem }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to redeem points');
      }
      const updatedData: UserLoyalty = await res.json();
      setLoyaltyData(updatedData);
      setShowRedeemModal(false);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) return <div className="p-4">Loading loyalty data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!loyaltyData) return <div className="p-4">No loyalty data available.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Loyalty Points Dashboard</h2>
      <div className="mb-4">
        <p className="text-lg">
          <span className="font-semibold">Total Points:</span> {loyaltyData.pointsBalance}
        </p>
        <p className="text-lg">
          <span className="font-semibold">Current Tier:</span> {loyaltyData.currentTier}
        </p>
      </div>
      <TierProgressBar progress={loyaltyData.tierProgress} currentTier={loyaltyData.currentTier} />
      {loyaltyData.pointsExpiryReminder && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          {loyaltyData.pointsExpiryReminder}
        </div>
      )}
      <button
        onClick={() => setShowRedeemModal(true)}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Redeem Points
      </button>
      {showRedeemModal && (
        <RedeemPointsModal
          pointsBalance={loyaltyData.pointsBalance}
          onClose={() => setShowRedeemModal(false)}
          onRedeem={handleRedeem}
        />
      )}
    </div>
  );
};

export default LoyaltyDashboard;
