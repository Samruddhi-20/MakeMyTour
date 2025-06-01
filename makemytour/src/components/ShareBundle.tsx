import React, { FC } from 'react';

interface ShareBundleProps {
  bundleName: string;
}

const ShareBundle: FC<ShareBundleProps> = ({ bundleName }) => {
  const handleShare = (platform: string): void => {
    alert(`Mock share of "${bundleName}" on ${platform}`);
  };

  return (
    <div className="flex space-x-4 mt-4">
      <button
        onClick={() => handleShare('WhatsApp')}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        aria-label="Share on WhatsApp"
      >
        WhatsApp
      </button>
      <button
        onClick={() => handleShare('Facebook')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        aria-label="Share on Facebook"
      >
        Facebook
      </button>
      <button
        onClick={() => handleShare('X')}
        className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
        aria-label="Share on X"
      >
        X
      </button>
    </div>
  );
};

export default ShareBundle;
