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
    const { frameStyle } = useGalleryStore();
    const frameClass = frameStyle === 'rounded' ? 'rounded-3xl' : 'rounded-none';
    
    // Calculate how to tile the pattern
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    
    useEffect(() => {
      const calculateScale = () => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        
        // Determine how many tiles fit horizontally
        const tilesPerRow = Math.floor(containerWidth / schema.canvas.width);
        const actualTileWidth = containerWidth / Math.max(1, tilesPerRow);
        
        setScale(actualTileWidth / schema.canvas.width);
      };
      
      calculateScale();
      window.addEventListener('resize', calculateScale);
      return () => window.removeEventListener('resize', calculateScale);
    }, [schema.canvas.width]);
  
    return (
      <div ref={containerRef} className="w-full">
        <div className="relative">
          {/* Repeat pattern for all photos */}
          {Array.from({ length: Math.ceil(photos.length / schema.rects.length) }).map((_, tileIndex) => (
            <div key={tileIndex} className="relative inline-block">
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
  