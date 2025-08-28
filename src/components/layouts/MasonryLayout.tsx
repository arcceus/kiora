import React from 'react';
import type { PhotoItem } from '../../store/gallery';
import { useGalleryStore } from '../../store/gallery';

interface MasonryLayoutProps {
  photos: PhotoItem[];
  onOpenLightbox: (index: number) => void;
}

export const MasonryLayout: React.FC<MasonryLayoutProps> = ({ photos, onOpenLightbox }) => {
  const { customFrameStyle } = useGalleryStore();
  const frameClass = customFrameStyle.includes('rounded') ? 'rounded-3xl' : 'rounded-none';
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          className={`mb-6 break-inside-avoid overflow-hidden ${frameClass} border border-black-800 bg-black-900 focus:outline-none`}
          onClick={() => onOpenLightbox(index)}
        >
          <img
            src={photo.src}
            alt={photo.caption || 'Photo'}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
};


