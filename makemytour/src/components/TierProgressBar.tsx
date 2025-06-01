import React from 'react';
import { TierLevel } from '../types/loyalty';

interface TierProgressBarProps {
  progress: number; // 0 to 100
  currentTier: TierLevel;
}

const TierProgressBar: React.FC<TierProgressBarProps> = ({ progress, currentTier }) => {
  const tierColors: Record<TierLevel, string> = {
    Silver: 'bg-gray-400',
    Gold: 'bg-yellow-400',
    Platinum: 'bg-purple-600',
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Tier Progress: {currentTier}</span>
        <span className="text-sm font-medium text-gray-700">{progress.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`${tierColors[currentTier]} h-4 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default TierProgressBar;
