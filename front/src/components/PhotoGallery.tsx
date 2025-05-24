import React from 'react';

interface PhotoGalleryProps {
  photos: string[];
  onDeletePhoto?: (index: number) => void;
}

export default function PhotoGallery({ photos, onDeletePhoto }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No photos taken yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {photos.map((photoUrl, index) => (
        <div key={index} className="relative group">
          <img
            src={photoUrl}
            alt={`Captured photo ${index + 1}`}
            className="w-full h-48 object-cover rounded-lg"
          />
          {onDeletePhoto && (
            <button
              onClick={() => onDeletePhoto(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 