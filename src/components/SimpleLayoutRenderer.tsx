// src/components/SimpleLayoutRenderer.tsx
import { useRef, useState, useEffect } from 'react';
import { useGalleryStore } from '../store/gallery';
import type { PhotoRect, LayoutSchema } from './SimpleLayoutEditor';
import type { LayoutTileSchema } from '../store/gallery';

interface SimpleLayoutRendererProps {
    schema: LayoutSchema | LayoutTileSchema;
    photos: PhotoRect[];
    onOpenLightbox: (index: number) => void;
  }

  // Type guard to check if schema is LayoutTileSchema
  const isTileSchema = (schema: LayoutSchema | LayoutTileSchema): schema is LayoutTileSchema => {
    return 'version' in schema && schema.version >= 2;
  };
  
  export const SimpleLayoutRenderer: React.FC<SimpleLayoutRendererProps> = ({
    schema,
    photos,
    onOpenLightbox
  }) => {
    const { customFrameStyle, scrollDirection } = useGalleryStore();
    const frameClass = customFrameStyle.includes('rounded') ? 'rounded-3xl' : 'rounded-none';

    // Determine node list and photo slots per tile (exclude non-photo elements like background/frame/sticker)
    const nodes = isTileSchema(schema) ? schema.nodes : (schema as any).rects;
    const getElementType = (node: any) => {
      // Default to 'photo' for legacy rects without explicit type
      return (node && typeof node.type === 'string') ? node.type : 'photo';
    };
    
    // Separate background elements from other elements
    const backgroundNodes = nodes.filter((n: any) => getElementType(n) === 'background');
    const nonBackgroundNodes = nodes.filter((n: any) => getElementType(n) !== 'background');
    
    const photoSlotsPerTile = nonBackgroundNodes.filter((n: any) => getElementType(n) === 'photo').length || 0;
    // For each rect index, compute its position among photo slots within a tile (-1 for non-photos)
    let photoCounter = 0;
    const photoSlotPositions = nonBackgroundNodes.map((n: any) => {
      if (getElementType(n) === 'photo') {
        const position = photoCounter;
        photoCounter += 1;
        return position;
      }
      return -1;
    });

    // Helper function to render different element types
    const renderElement = (node: any, photoIndex?: number) => {
      const elementType = isTileSchema(schema) ? node.type : 'photo';
      const elementData = isTileSchema(schema) ? node : null;

      switch (elementType) {
        case 'sticker':
          if (elementData?.stickerData?.src) {
            // Uploaded PNG sticker
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={elementData.stickerData.src}
                  alt={elementData.stickerData.name || 'Uploaded sticker'}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            );
          } else {
            // Emoji sticker
            return (
              <div className="flex items-center justify-center w-full h-full text-4xl">
                {elementData?.stickerData?.emoji || '🎨'}
              </div>
            );
          }

        case 'frame':
          if (elementData?.frameData?.src) {
            // Uploaded PNG frame
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={elementData.frameData.src}
                  alt={elementData.frameData.name || 'Uploaded frame'}
                  className="w-full h-full object-contain"
                />
              </div>
            );
          } else {
            // No PNG frame uploaded - show placeholder like stickers
            return (
              <div className="flex items-center justify-center w-full h-full text-4xl">
                🖼️
              </div>
            );
          }

        case 'background':
          return (
            <div className="relative w-full h-full overflow-hidden">
              {elementData?.backgroundData?.src && elementData.backgroundData.src.trim() !== '' ? (
                <img
                  src={elementData.backgroundData.src}
                  alt={elementData.backgroundData.name || 'Background'}
                  className="w-screen h-screen object-cover absolute inset-0 select-none"
                  style={{
                    opacity: elementData.backgroundData.opacity || 1,
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              ) : (
                <div
                  className="w-screen h-screen absolute inset-0"
                  style={{
                    backgroundColor: '#F3F4F6', // Default gray background
                    opacity: elementData?.backgroundData?.opacity || 1
                  }}
                />
              )}
            </div>
          );

        default: // photo
          if (photoIndex === undefined || !photos[photoIndex]) return null;
          const photo = photos[photoIndex];

          return (
            <button
              className={`w-full h-full overflow-hidden ${frameClass} border border-gray-800 bg-gray-900 hover:border-gray-600 transition-colors`}
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
      }
    };
    
    // Calculate how to tile the pattern
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    
    useEffect(() => {
      const calculateScale = () => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        const canvasDims = isTileSchema(schema)
          ? { width: schema.tileSize.width, height: schema.tileSize.height }
          : schema.canvas;

        if (scrollDirection === 'horizontal') {
          // For horizontal scrolling, scale to use available height (up to 3x original size)
          const heightRatio = containerHeight / canvasDims.height;
          setScale(Math.min(Math.max(heightRatio, 0.5), 3)); // Scale between 0.5x and 3x
        } else {
          // For vertical scrolling, scale to use available width (up to 3x original size)
          const widthRatio = containerWidth / canvasDims.width;
          setScale(Math.min(Math.max(widthRatio, 0.5), 3)); // Scale between 0.5x and 3x
        }
      };

      calculateScale();
      window.addEventListener('resize', calculateScale);
      return () => window.removeEventListener('resize', calculateScale);
    }, [schema, scrollDirection, isTileSchema]);
  
    if (scrollDirection === 'horizontal') {
      return (
        <div className="relative w-full h-full">
          {/* Fixed background layer - fills entire screen */}
          {backgroundNodes.map((bgNode: any, bgIndex: number) => (
            <div
              key={`bg-${bgIndex}`}
              className="fixed inset-0 pointer-events-none"
              style={{
                zIndex: -10,
              }}
            >
              {renderElement(isTileSchema(schema) ? bgNode : bgNode)}
            </div>
          ))}
          
          <div ref={containerRef} className="w-full overflow-x-auto whitespace-nowrap">
            <div className="relative flex">
              {/* Repeat pattern for all photos and non-background elements */}
              {Array.from({ length: Math.ceil(photos.length / Math.max(photoSlotsPerTile, 1)) }).map((_, tileIndex) => (
                <div
                  key={tileIndex}
                  className="relative flex-shrink-0"
                  style={{
                    width: (isTileSchema(schema) ? schema.tileSize.width : schema.canvas.width) * scale,
                    height: (isTileSchema(schema) ? schema.tileSize.height : schema.canvas.height) * scale
                  }}
                >
                  {nonBackgroundNodes.map((rect: any, rectIndex: number) => {
                    const slotPos = photoSlotPositions[rectIndex];
                    const computedPhotoIndex = slotPos === -1 ? undefined : (tileIndex * photoSlotsPerTile + slotPos);
                    const node = isTileSchema(schema) ? nonBackgroundNodes[rectIndex] : null;

                    return (
                      <div
                        key={`${tileIndex}-${rectIndex}`}
                        className="absolute"
                        style={{
                          left: rect.frame.x * scale,
                          top: rect.frame.y * scale,
                          width: rect.frame.width * scale,
                          height: rect.frame.height * scale,
                          zIndex: (isTileSchema(schema) ? node?.zIndex : rect.zIndex) || rectIndex,
                          transform: `rotate(${(isTileSchema(schema) ? node?.rotation : rect.rotation) || 0}deg)`,
                          transformOrigin: 'center center',
                        }}
                      >
                        {renderElement(node || rect, computedPhotoIndex)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Vertical scrolling layout
    return (
      <div className="relative w-full h-full">
        {/* Fixed background layer - fills entire screen */}
        {backgroundNodes.map((bgNode: any, bgIndex: number) => (
          <div
            key={`bg-${bgIndex}`}
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: -10,
            }}
          >
            {renderElement(isTileSchema(schema) ? bgNode : bgNode)}
          </div>
        ))}
        
        <div ref={containerRef} className="w-full overflow-y-auto">
          <div className="relative flex flex-col items-center">
            {/* Repeat pattern for all photos and non-background elements */}
            {Array.from({ length: Math.ceil(photos.length / Math.max(photoSlotsPerTile, 1)) }).map((_, tileIndex) => (
              <div
                key={tileIndex}
                className="relative flex-shrink-0"
                style={{
                  width: (isTileSchema(schema) ? schema.tileSize.width : schema.canvas.width) * scale,
                  height: (isTileSchema(schema) ? schema.tileSize.height : schema.canvas.height) * scale
                }}
              >
                {nonBackgroundNodes.map((rect: any, rectIndex: number) => {
                  const slotPos = photoSlotPositions[rectIndex];
                  const computedPhotoIndex = slotPos === -1 ? undefined : (tileIndex * photoSlotsPerTile + slotPos);
                  const node = isTileSchema(schema) ? nonBackgroundNodes[rectIndex] : null;

                                      return (
                      <div
                        key={`${tileIndex}-${rectIndex}`}
                        className="absolute"
                        style={{
                          left: rect.frame.x * scale,
                          top: rect.frame.y * scale,
                          width: rect.frame.width * scale,
                          height: rect.frame.height * scale,
                          zIndex: (isTileSchema(schema) ? node?.zIndex : rect.zIndex) || rectIndex,
                          transform: `rotate(${(isTileSchema(schema) ? node?.rotation : rect.rotation) || 0}deg)`,
                          transformOrigin: 'center center',
                        }}
                      >
                      {renderElement(node || rect, computedPhotoIndex)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
