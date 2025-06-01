import React, { useState } from 'react';

interface PriceFreezeButtonProps {
  isFrozen: boolean;
  freezeUntil?: number;
  onFreeze: () => Promise<void>;
}

const PriceFreezeButton: React.FC<PriceFreezeButtonProps> = ({
  isFrozen,
  freezeUntil,
  onFreeze,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (isFrozen) return;
    setLoading(true);
    try {
      await onFreeze();
    } finally {
      setLoading(false);
    }
  };

  const formatFreezeTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isFrozen || loading}
      className={
        'px-4 py-2 rounded ' +
        (isFrozen
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white') +
        ' transition-colors'
      }
      title={
        isFrozen
          ? `Price frozen until ${formatFreezeTime(freezeUntil)}`
          : 'Freeze price for 24 hours'
      }
    >
      {loading ? 'Freezing...' : isFrozen ? 'Price Frozen' : 'Freeze Price'}
    </button>
  );
};

export default PriceFreezeButton;
