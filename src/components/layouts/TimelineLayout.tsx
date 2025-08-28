import React from 'react';
import type { PhotoItem } from '../../store/gallery';
import { useGalleryStore } from '../../store/gallery';

interface TimelineLayoutProps {
  photos: PhotoItem[];
  onOpenLightbox: (index: number) => void;
}

export const TimelineLayout: React.FC<TimelineLayoutProps> = ({ photos, onOpenLightbox }) => {
  const { customFrameStyle } = useGalleryStore();
  const frameClass = customFrameStyle.includes('rounded') ? 'rounded-2xl' : 'rounded-none';
  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-black-700" />
      <div className="space-y-10">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative pl-10">
            <div className="absolute left-2 top-2 w-3 h-3 rounded-full bg-white border border-black-700" />
            <button
              className={`overflow-hidden ${frameClass} border border-black-800 bg-black-900 focus:outline-none`}
              onClick={() => onOpenLightbox(index)}
            >
              <img
                src={photo.src}
                alt={photo.caption || 'Photo'}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </button>
            <div className="mt-2 text-sm text-black-300">{photo.caption || `Moment ${index + 1}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};


