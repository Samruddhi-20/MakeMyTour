import React, { useState } from 'react';

interface RedeemPointsModalProps {
  pointsBalance: number;
  onClose: () => void;
  onRedeem: (pointsToRedeem: number) => void;
}

const RedeemPointsModal: React.FC<RedeemPointsModalProps> = ({ pointsBalance, onClose, onRedeem }) => {
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleRedeemClick = () => {
    if (pointsToRedeem <= 0) {
      setError('Please enter a positive number of points to redeem.');
      return;
    }
    if (pointsToRedeem > pointsBalance) {
      setError('You cannot redeem more points than your balance.');
      return;
    }
    setError(null);
    onRedeem(pointsToRedeem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-full">
        <h3 className="text-xl font-semibold mb-4">Redeem Points</h3>
        <p className="mb-2">Your Points Balance: {pointsBalance}</p>
        <input
          type="number"
          min={0}
          max={pointsBalance}
          value={pointsToRedeem}
          onChange={(e) => setPointsToRedeem(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter points to redeem"
        />
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRedeemClick}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedeemPointsModal;
