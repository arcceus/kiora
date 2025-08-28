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
    const photoSlotsPerTile = nodes.filter((n: any) => getElementType(n) === 'photo').length || 0;
    // For each rect index, compute its position among photo slots within a tile (-1 for non-photos)
    let photoCounter = 0;
    const photoSlotPositions = nodes.map((n: any) => {
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
            // Predefined frame style
            const frameStyle = elementData?.frameData?.style;
            const frameColor = elementData?.frameData?.color || '#000000';
            const frameThickness = elementData?.frameData?.thickness || 4;

            switch (frameStyle) {
              case 'rounded':
                return (
                  <div
                    className="w-full h-full rounded-lg flex items-center justify-center bg-gray-200"
                    style={{
                      border: `${frameThickness}px solid ${frameColor}`,
                      borderRadius: '12px'
                    }}
                  >
                    <div className="text-xs text-gray-600">Photo Frame</div>
                  </div>
                );

              case 'polaroid':
                return (
                  <div
                    className="w-full h-full bg-white flex flex-col items-center justify-center"
                    style={{
                      border: `${frameThickness}px solid ${frameColor}`,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div className="flex-1 flex items-center justify-center bg-gray-200 w-full">
                      <div className="text-xs text-gray-600">Photo</div>
                    </div>
                    <div className="w-3/4 h-8 mt-2 bg-gray-100"></div>
                  </div>
                );

              case 'vintage':
                return (
                  <div
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200"
                    style={{
                      border: `${frameThickness}px solid ${frameColor}`,
                      borderImage: `linear-gradient(45deg, ${frameColor}, transparent) 1`
                    }}
                  >
                    <div className="text-xs text-gray-600">Vintage Frame</div>
                  </div>
                );

              default: // simple
                return (
                  <div
                    className="w-full h-full flex items-center justify-center bg-gray-200"
                    style={{ border: `${frameThickness}px solid ${frameColor}` }}
                  >
                    <div className="text-xs text-gray-600">Photo Frame</div>
                  </div>
                );
            }
          }

        case 'background':
          return (
            <div className="relative w-full h-full overflow-hidden">
              {elementData?.backgroundData?.src && elementData.backgroundData.src.trim() !== '' ? (
                <img
                  src={elementData.backgroundData.src}
                  alt={elementData.backgroundData.name || 'Background'}
                  className="w-full h-full object-cover absolute inset-0 select-none"
                  style={{
                    opacity: elementData.backgroundData.opacity || 1,
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              ) : (
                <div
                  className="w-full h-full absolute inset-0"
                  style={{
                    backgroundColor: elementData?.backgroundData?.name === 'Solid Blue' ? '#3B82F6' :
                                   elementData?.backgroundData?.name === 'Solid Red' ? '#EF4444' :
                                   elementData?.backgroundData?.name === 'Solid Green' ? '#10B981' :
                                   elementData?.backgroundData?.name === 'Solid Yellow' ? '#F59E0B' : '#F3F4F6',
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
        <div ref={containerRef} className="w-full overflow-x-auto whitespace-nowrap">
          <div className="relative flex">
            {/* Repeat pattern for all photos */}
            {Array.from({ length: Math.ceil(photos.length / Math.max(photoSlotsPerTile, 1)) }).map((_, tileIndex) => (
              <div
                key={tileIndex}
                className="relative flex-shrink-0"
                style={{
                  width: (isTileSchema(schema) ? schema.tileSize.width : schema.canvas.width) * scale,
                  height: (isTileSchema(schema) ? schema.tileSize.height : schema.canvas.height) * scale
                }}
              >
                {nodes.map((rect: any, rectIndex: number) => {
                  const slotPos = photoSlotPositions[rectIndex];
                  const computedPhotoIndex = slotPos === -1 ? undefined : (tileIndex * photoSlotsPerTile + slotPos);
                  const node = isTileSchema(schema) ? nodes[rectIndex] : null;

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
      );
    }

    // Vertical scrolling layout
    return (
      <div ref={containerRef} className="w-full overflow-y-auto">
        <div className="relative flex flex-col items-center">
          {/* Repeat pattern for all photos */}
          {Array.from({ length: Math.ceil(photos.length / Math.max(photoSlotsPerTile, 1)) }).map((_, tileIndex) => (
            <div
              key={tileIndex}
              className="relative flex-shrink-0"
              style={{
                width: (isTileSchema(schema) ? schema.tileSize.width : schema.canvas.width) * scale,
                height: (isTileSchema(schema) ? schema.tileSize.height : schema.canvas.height) * scale
              }}
            >
              {nodes.map((rect: any, rectIndex: number) => {
                const slotPos = photoSlotPositions[rectIndex];
                const computedPhotoIndex = slotPos === -1 ? undefined : (tileIndex * photoSlotsPerTile + slotPos);
                const node = isTileSchema(schema) ? nodes[rectIndex] : null;

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
    );
  };
  
