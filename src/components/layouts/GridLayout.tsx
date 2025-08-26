import React from 'react';
import type { PhotoItem } from '../../store/gallery';

interface GridLayoutProps {
  photos: PhotoItem[];
  onOpenLightbox: (index: number) => void;
}

export const GridLayout: React.FC<GridLayoutProps> = ({ photos, onOpenLightbox }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          className="aspect-square overflow-hidden rounded-3xl border border-black-800 bg-black-900 focus:outline-none"
          onClick={() => onOpenLightbox(index)}
        >
          <img
            src={photo.src}
            alt={photo.caption || 'Photo'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
};


