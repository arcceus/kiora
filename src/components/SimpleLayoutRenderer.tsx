// src/components/SimpleLayoutRenderer.tsx
import { useRef, useState, useEffect } from 'react';
import { getAsset } from '../lib/idb';
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

    // Discover default layout assets (backgrounds, frames, stickers) bundled with the app
    // These are loaded from src/layouts/** and src/assets/layouts/** similar to the editor
    const defaultLayoutsA = (import.meta as any).glob('/src/layouts/**/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' }) as Record<string, string>;
    const defaultLayoutsB = (import.meta as any).glob('/src/assets/layouts/**/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' }) as Record<string, string>;
    const defaultAssets: Record<string, string> = { ...defaultLayoutsA, ...defaultLayoutsB };

    const filenameOf = (path: string) => {
      const parts = path.split('/');
      return parts[parts.length - 1] || path;
    };
    const baseName = (name: string) => name.replace(/\.[^.]+$/, '').toLowerCase();

    // Build maps of defaults by name for quick lookup
    const defaultStickersByName: Map<string, string> = new Map();
    const defaultFramesByName: Map<string, string> = new Map();
    const defaultBackgroundsByName: Map<string, string> = new Map();
    for (const [path, url] of Object.entries(defaultAssets)) {
      const file = filenameOf(path);
      const base = baseName(file);
      if (base === 'background' || base === 'bg' || base.includes('background')) {
        defaultBackgroundsByName.set(file, url);
        defaultBackgroundsByName.set(base, url);
      } else if (base.startsWith('frame') || base.includes('frame')) {
        defaultFramesByName.set(file, url);
        defaultFramesByName.set(base, url);
      } else {
        defaultStickersByName.set(file, url);
        defaultStickersByName.set(base, url);
      }
    }

    // Load uploaded assets metadata from localStorage (names), and lazily fetch blobs from IndexedDB on demand
    const [uploadedAssets, setUploadedAssets] = useState<{ stickers: any[]; frames: any[]; backgrounds: any[] }>({ stickers: [], frames: [], backgrounds: [] });
    useEffect(() => {
      try {
        const stickers = JSON.parse(localStorage.getItem('uploadedStickers') || '[]');
        const frames = JSON.parse(localStorage.getItem('uploadedFrames') || '[]');
        const backgrounds = JSON.parse(localStorage.getItem('uploadedBackgrounds') || '[]');
        setUploadedAssets({ stickers, frames, backgrounds });
      } catch {
        setUploadedAssets({ stickers: [], frames: [], backgrounds: [] });
      }
    }, []);

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

    // Resolve asset src if it was sanitized before saving (rehydrate by name)
    const resolveStickerSrc = (node: any): string | undefined => {
      const name = node?.stickerData?.name;
      if (node?.stickerData?.src) return node.stickerData.src;
      if (node?.stickerData?.isUploaded && name) {
        const match = uploadedAssets.stickers.find((s: any) => s?.name === name);
        if ((match as any)?.src) return (match as any).src;
        // Trigger async fetch from IDB and update state with object URL
        (async () => {
          const blob = await getAsset('stickers', name);
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            setUploadedAssets(prev => ({
              ...prev,
              stickers: prev.stickers.map((s: any) => s?.name === name ? { ...s, src: objectUrl } : s)
            }));
          }
        })();
        return undefined;
      }
      // Try resolve from default assets by name
      if (name) {
        const key = baseName(name);
        return defaultStickersByName.get(name) || defaultStickersByName.get(key);
      }
      return undefined;
    };

    const resolveFrameSrc = (node: any): string | undefined => {
      const name = node?.frameData?.name;
      if (node?.frameData?.src) return node.frameData.src;
      if (node?.frameData?.isUploaded && name) {
        const match = uploadedAssets.frames.find((f: any) => f?.name === name);
        if ((match as any)?.src) return (match as any).src;
        (async () => {
          const blob = await getAsset('frames', name);
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            setUploadedAssets(prev => ({
              ...prev,
              frames: prev.frames.map((f: any) => f?.name === name ? { ...f, src: objectUrl } : f)
            }));
          }
        })();
        return undefined;
      }
      // Try resolve from default assets by name
      if (name) {
        const key = baseName(name);
        return defaultFramesByName.get(name) || defaultFramesByName.get(key);
      }
      return undefined;
    };

    const resolveBackgroundSrc = (node: any): string | undefined => {
      const name = node?.backgroundData?.name;
      if (node?.backgroundData?.src) return node.backgroundData.src;
      if (node?.backgroundData?.isUploaded && name) {
        const match = uploadedAssets.backgrounds.find((b: any) => b?.name === name);
        if ((match as any)?.src) return (match as any).src;
        (async () => {
          const blob = await getAsset('backgrounds', name);
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            setUploadedAssets(prev => ({
              ...prev,
              backgrounds: prev.backgrounds.map((b: any) => b?.name === name ? { ...b, src: objectUrl } : b)
            }));
          }
        })();
        return undefined;
      }
      // Try resolve from default assets by name
      if (name) {
        const key = baseName(name);
        return defaultBackgroundsByName.get(name) || defaultBackgroundsByName.get(key);
      }
      return undefined;
    };

    // Helper function to render different element types
    const renderElement = (node: any, photoIndex?: number) => {
      const elementType = isTileSchema(schema) ? node.type : 'photo';
      const elementData = isTileSchema(schema) ? node : null;

      switch (elementType) {
        case 'sticker':
          {
            const src = resolveStickerSrc(elementData);
            if (src) {
            // Uploaded PNG sticker
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={src}
                  alt={elementData?.stickerData?.name || 'Uploaded sticker'}
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
        }

        case 'frame':
          {
            const src = resolveFrameSrc(elementData);
            if (src) {
            // Uploaded PNG frame
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={src}
                  alt={elementData?.frameData?.name || 'Uploaded frame'}
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
        }

        case 'background':
          {
            const bgSrc = resolveBackgroundSrc(elementData);
            return (
              <div className="relative w-full h-full overflow-hidden">
                {bgSrc && bgSrc.trim() !== '' ? (
                  <img
                    src={bgSrc}
                    alt={elementData?.backgroundData?.name || 'Background'}
                    className="w-screen h-screen object-cover absolute inset-0 select-none"
                    style={{
                      opacity: elementData?.backgroundData?.opacity || 1,
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
          }

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
  
