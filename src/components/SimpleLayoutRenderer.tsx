// src/components/SimpleLayoutRenderer.tsx
import { useRef, useState, useEffect } from 'react';
import { useGalleryStore } from '../store/gallery';
import type { PhotoRect, LayoutSchema } from './SimpleLayoutEditor';

interface SimpleLayoutRendererProps {
    schema: LayoutSchema;
    photos: PhotoRect[];
    onOpenLightbox: (index: number) => void;
  }
  
  export const SimpleLayoutRenderer: React.FC<SimpleLayoutRendererProps> = ({
    schema,
    photos,
    onOpenLightbox
  }) => {
    const { frameStyle, scrollDirection } = useGalleryStore();
    const frameClass = frameStyle === 'rounded' ? 'rounded-3xl' : 'rounded-none';
    
    // Calculate how to tile the pattern
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    
    useEffect(() => {
      const calculateScale = () => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        if (scrollDirection === 'horizontal') {
          // For horizontal scrolling, scale to use available height (up to 3x original size)
          const heightRatio = containerHeight / schema.canvas.height;
          setScale(Math.min(Math.max(heightRatio, 0.5), 3)); // Scale between 0.5x and 3x
        } else {
          // For vertical scrolling, scale to use available width (up to 3x original size)
          const widthRatio = containerWidth / schema.canvas.width;
          setScale(Math.min(Math.max(widthRatio, 0.5), 3)); // Scale between 0.5x and 3x
        }
      };

      calculateScale();
      window.addEventListener('resize', calculateScale);
      return () => window.removeEventListener('resize', calculateScale);
    }, [schema.canvas.width, schema.canvas.height, scrollDirection]);
  
    if (scrollDirection === 'horizontal') {
      return (
        <div ref={containerRef} className="w-full overflow-x-auto whitespace-nowrap">
          <div className="relative flex">
            {/* Repeat pattern for all photos */}
            {Array.from({ length: Math.ceil(photos.length / schema.rects.length) }).map((_, tileIndex) => (
              <div
                key={tileIndex}
                className="relative flex-shrink-0"
                style={{
                  width: schema.canvas.width * scale,
                  height: schema.canvas.height * scale
                }}
              >
                {schema.rects.map((rect, rectIndex) => {
                  const photoIndex = (tileIndex * schema.rects.length + rectIndex) % photos.length;
                  const photo = photos[photoIndex];

                  if (!photo) return null;

                  return (
                    <button
                      key={`${tileIndex}-${rectIndex}`}
                      className={`absolute overflow-hidden ${frameClass} border border-gray-800 bg-gray-900 hover:border-gray-600 transition-colors`}
                      style={{
                        left: rect.x * scale,
                        top: rect.y * scale,
                        width: rect.width * scale,
                        height: rect.height * scale,
                      }}
                      onClick={() => onOpenLightbox(photoIndex)}
                    >
                      <img
                        src={photo.src}
                        alt={photo.caption || 'Photo'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Vertical scrolling layout
    return (
      <div ref={containerRef} className="w-full overflow-y-auto">
        <div className="relative flex flex-col items-center">
          {/* Repeat pattern for all photos */}
          {Array.from({ length: Math.ceil(photos.length / schema.rects.length) }).map((_, tileIndex) => (
            <div
              key={tileIndex}
              className="relative flex-shrink-0"
              style={{
                width: schema.canvas.width * scale,
                height: schema.canvas.height * scale
              }}
            >
              {schema.rects.map((rect, rectIndex) => {
                const photoIndex = (tileIndex * schema.rects.length + rectIndex) % photos.length;
                const photo = photos[photoIndex];

                if (!photo) return null;

                return (
                  <button
                    key={`${tileIndex}-${rectIndex}`}
                    className={`absolute overflow-hidden ${frameClass} border border-gray-800 bg-gray-900 hover:border-gray-600 transition-colors`}
                    style={{
                      left: rect.x * scale,
                      top: rect.y * scale,
                      width: rect.width * scale,
                      height: rect.height * scale,
                    }}
                    onClick={() => onOpenLightbox(photoIndex)}
                  >
                    <img
                      src={photo.src}
                      alt={photo.caption || 'Photo'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  