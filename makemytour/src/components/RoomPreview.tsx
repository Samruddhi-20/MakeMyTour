import React from 'react';

interface RoomPreviewProps {
  preview3D?: string;
}

const RoomPreview: React.FC<RoomPreviewProps> = ({ preview3D }) => {
  if (!preview3D) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md text-gray-500">
        3D Preview Not Available
      </div>
    );
  }

  const isVideo = preview3D.endsWith('.mp4') || preview3D.endsWith('.webm');

  return (
    <div className="w-full h-64 rounded-md overflow-hidden bg-gray-100">
      {isVideo ? (
        <video
          src={preview3D}
          controls
          className="w-full h-full object-cover"
          aria-label="3D room preview video"
        />
      ) : (
        <img
          src={preview3D}
          alt="3D room preview"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default RoomPreview;
