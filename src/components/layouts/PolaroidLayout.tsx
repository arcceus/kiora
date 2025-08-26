import React, { useMemo } from 'react';
import type { PhotoItem } from '../../store/gallery';

interface PolaroidLayoutProps {
  photos: PhotoItem[];
  onOpenLightbox: (index: number) => void;
}

export const PolaroidLayout: React.FC<PolaroidLayoutProps> = ({ photos, onOpenLightbox }) => {
  const rotations = useMemo(() => ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'], []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {photos.map((photo, index) => (
        <div key={photo.id} className="relative">
          <button
            className={`bg-white text-black rounded-[1rem] p-3 shadow-2xl ${rotations[index % rotations.length]} transition-transform hover:rotate-0 focus:outline-none`}
            onClick={() => onOpenLightbox(index)}
          >
            <div className="overflow-hidden rounded-lg">
              <img
                src={photo.src}
                alt={photo.caption || 'Photo'}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            <div className="pt-3 text-center text-sm font-medium min-h-6">
              {photo.caption || 'Polaroid'}
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};


