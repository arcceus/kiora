// src/components/SimpleLayoutEditor.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryStore } from '../store/gallery';
import { DraggableRect } from './DraggableRect';
import { ThemesDialog } from './dialog/ThemesDialog';

export type ElementType = 'photo' | 'sticker' | 'frame' | 'background';

export interface StickerData {
  emoji?: string;
  src?: string;
  color?: string;
  name?: string;
  isUploaded?: boolean;
}

export interface FrameData {
  style: 'simple' | 'rounded' | 'polaroid' | 'vintage';
  color?: string;
  thickness?: number;
  src?: string;
  name?: string;
  isUploaded?: boolean;
}

export interface BackgroundData {
  src: string;
  name?: string;
  opacity?: number;
  isUploaded?: boolean;
}

export interface PhotoRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src?: string;
  caption?: string;
  aspectRatio?: { width: number; height: number };
  type: ElementType;
  stickerData?: StickerData;
  frameData?: FrameData;
  backgroundData?: BackgroundData;
  zIndex?: number;
  rotation?: number; // Rotation in degrees (0-360)
}

export interface LayoutSchema {
  canvas: { width: number; height: number };
  rects: PhotoRect[];
}

export const SimpleLayoutEditor = () => {
  const navigate = useNavigate();
  const { setLayoutSchema, savedLayouts } = useGalleryStore();
  const [rects, setRects] = useState<PhotoRect[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadedStickers, setUploadedStickers] = useState<StickerData[]>([]);
  const [uploadedFrames, setUploadedFrames] = useState<FrameData[]>([]);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<BackgroundData[]>([]);
  const [themesDialogOpen, setThemesDialogOpen] = useState(false);

  const CANVAS_WIDTH = 1000;
  const CANVAS_HEIGHT = 650;

  // Convert LayoutSchema to LayoutTileSchema for gallery store
  const convertToLayoutTileSchema = (layoutSchema: LayoutSchema) => {
    return {
      id: `layout_${Date.now()}`,
      tileSize: { width: layoutSchema.canvas.width, height: layoutSchema.canvas.height },
      nodes: layoutSchema.rects.map((rect, index) => ({
        id: rect.id,
        frame: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        zIndex: rect.zIndex || index,
        // Include full element data for rendering
        type: rect.type,
        src: rect.src,
        caption: rect.caption,
        aspectRatio: rect.aspectRatio,
        stickerData: rect.stickerData,
        frameData: rect.frameData,
        backgroundData: rect.backgroundData,
        rotation: rect.rotation || 0
      })),
      version: 2 as const // Updated version to indicate enhanced schema
    };
  };

  // Load uploaded assets from localStorage on component mount
  useEffect(() => {
    const savedStickers = localStorage.getItem('uploadedStickers');
    const savedFrames = localStorage.getItem('uploadedFrames');
    const savedBackgrounds = localStorage.getItem('uploadedBackgrounds');

    if (savedStickers) {
      try {
        setUploadedStickers(JSON.parse(savedStickers));
      } catch (e) {
        console.error('Failed to load uploaded stickers:', e);
      }
    }

    if (savedFrames) {
      try {
        setUploadedFrames(JSON.parse(savedFrames));
      } catch (e) {
        console.error('Failed to load uploaded frames:', e);
      }
    }

    if (savedBackgrounds) {
      try {
        setUploadedBackgrounds(JSON.parse(savedBackgrounds));
      } catch (e) {
        console.error('Failed to load uploaded backgrounds:', e);
      }
    }
  }, []);

  const validatePNGFile = (file: File): boolean => {
    return file.type === 'image/png' && file.size <= 5 * 1024 * 1024; // 5MB limit
  };

  const handleStickerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!validatePNGFile(file)) {
        alert(`${file.name} is not a valid PNG file or exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newSticker: StickerData = {
          src: result,
          name: file.name.replace('.png', ''),
          isUploaded: true
        };

        const updatedStickers = [...uploadedStickers, newSticker];
        setUploadedStickers(updatedStickers);
        localStorage.setItem('uploadedStickers', JSON.stringify(updatedStickers));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const handleFrameUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!validatePNGFile(file)) {
        alert(`${file.name} is not a valid PNG file or exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newFrame: FrameData = {
          style: 'simple',
          src: result,
          name: file.name.replace('.png', ''),
          isUploaded: true
        };

        const updatedFrames = [...uploadedFrames, newFrame];
        setUploadedFrames(updatedFrames);
        localStorage.setItem('uploadedFrames', JSON.stringify(updatedFrames));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!validatePNGFile(file)) {
        alert(`${file.name} is not a valid PNG file or exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newBackground: BackgroundData = {
          src: result,
          name: file.name.replace('.png', ''),
          opacity: 1,
          isUploaded: true
        };

        const updatedBackgrounds = [...uploadedBackgrounds, newBackground];
        setUploadedBackgrounds(updatedBackgrounds);
        localStorage.setItem('uploadedBackgrounds', JSON.stringify(updatedBackgrounds));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const addPhoto = () => {
    const newRect: PhotoRect = {
      id: Date.now().toString(),
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      type: 'photo',
      zIndex: rects.length,
      rotation: 0,
    };
    setRects([...rects, newRect]);
  };

  const addPhotoWithRatio = (aspectRatio: { width: number; height: number }) => {
    // Calculate size based on aspect ratio with reasonable maximum dimensions
    const maxWidth = Math.min(200, CANVAS_WIDTH * 0.4);
    const maxHeight = Math.min(150, CANVAS_HEIGHT * 0.4);

    // Scale based on which dimension is more constrained
    const scaleByWidth = maxWidth / aspectRatio.width;
    const scaleByHeight = maxHeight / aspectRatio.height;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    const width = Math.round(aspectRatio.width * scale);
    const height = Math.round(aspectRatio.height * scale);

    // Ensure we don't place it outside the canvas
    const maxX = Math.max(0, CANVAS_WIDTH - width);
    const maxY = Math.max(0, CANVAS_HEIGHT - height);

    const newRect: PhotoRect = {
      id: Date.now().toString(),
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      width: width,
      height: height,
      aspectRatio: aspectRatio,
      type: 'photo',
      zIndex: rects.length,
      rotation: 0,
    };
    setRects([...rects, newRect]);
  };

  const addSticker = (stickerData: StickerData) => {
    const newRect: PhotoRect = {
      id: Date.now().toString(),
      x: Math.random() * (CANVAS_WIDTH - 80),
      y: Math.random() * (CANVAS_HEIGHT - 80),
      width: 60,
      height: 60,
      type: 'sticker',
      stickerData: stickerData,
      zIndex: rects.length,
      rotation: 0,
    };
    setRects([...rects, newRect]);
  };

  const addFrame = (frameData: FrameData) => {
    const newRect: PhotoRect = {
      id: Date.now().toString(),
      x: Math.random() * (CANVAS_WIDTH - 120),
      y: Math.random() * (CANVAS_HEIGHT - 120),
      width: 120,
      height: 120,
      type: 'frame',
      frameData: frameData,
      zIndex: rects.length,
      rotation: 0,
    };
    setRects([...rects, newRect]);
  };

  const addBackground = (backgroundData: BackgroundData) => {
    // Remove existing backgrounds first
    const filteredRects = rects.filter(rect => rect.type !== 'background');

    // Find the minimum z-index among non-background elements, or use 1 as default
    const minZIndex = filteredRects.length > 0
      ? Math.min(...filteredRects.map(r => r.zIndex || 1)) - 1
      : 0;

    const newRect: PhotoRect = {
      id: Date.now().toString(),
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      type: 'background',
      backgroundData: backgroundData,
      zIndex: Math.max(0, minZIndex), // Background should be behind all other elements
      rotation: 0,
    };

    setRects([...filteredRects, newRect]);
  };

  const deleteElement = (id: string) => {
    setRects(rects.filter(rect => rect.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const bringToFront = (id: string) => {
    const maxZIndex = Math.max(...rects.map(r => r.zIndex || 0));
    setRects(rects.map(rect =>
      rect.id === id ? { ...rect, zIndex: maxZIndex + 1 } : rect
    ));
  };

  const sendToBack = (id: string) => {
    const minZIndex = Math.min(...rects.map(r => r.zIndex || 0));
    // Ensure the element stays visible by setting zIndex to 0 if it would go negative
    const newZIndex = Math.max(0, minZIndex - 1);
    setRects(rects.map(rect =>
      rect.id === id ? { ...rect, zIndex: newZIndex } : rect
    ));
  };

  const clearUploadedAssets = () => {
    setUploadedStickers([]);
    setUploadedFrames([]);
    setUploadedBackgrounds([]);
    localStorage.removeItem('uploadedStickers');
    localStorage.removeItem('uploadedFrames');
    localStorage.removeItem('uploadedBackgrounds');
  };

  const clearBackground = () => {
    setRects(rects.filter(rect => rect.type !== 'background'));
  };

  const hasBackground = rects.some(rect => rect.type === 'background');

  const exportLayout = (): LayoutSchema => {
    return {
      canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      rects: rects
    };
  };

  const updateRect = (id: string, updates: Partial<PhotoRect>) => {
    setRects(prevRects => prevRects.map(rect =>
      rect.id === id ? { ...rect, ...updates } : rect
    ));
  };

  // No predefined sticker options - users upload their own

  // No predefined frame options - users upload their own PNG frames

  // No predefined background options - users upload their own backgrounds

  return (
    <div className="flex justify-center items-start flex-col min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex flex-col gap-4">
            {/* Photos Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Photos</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={addPhoto}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Add Photo
                </button>
                <button
                  onClick={() => addPhotoWithRatio({ width: 16, height: 9 })}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  title="16:9 Landscape"
                >
                  16:9
                </button>
                <button
                  onClick={() => addPhotoWithRatio({ width: 4, height: 3 })}
                  className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  title="4:3 Standard"
                >
                  4:3
                </button>
                <button
                  onClick={() => addPhotoWithRatio({ width: 1, height: 1 })}
                  className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                  title="1:1 Square"
                >
                  1:1
                </button>
                <button
                  onClick={() => addPhotoWithRatio({ width: 3, height: 4 })}
                  className="px-3 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm"
                  title="3:4 Portrait"
                >
                  3:4
                </button>
              </div>
            </div>

            {/* Stickers Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Stickers</h3>
                <label className="text-xs bg-blue-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-blue-600 transition-colors">
                  Upload PNG
                  <input
                    type="file"
                    accept=".png,image/png"
                    multiple
                    onChange={handleStickerUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* No predefined stickers - users upload their own */}
                {/* Uploaded stickers */}
                {uploadedStickers.map((sticker, index) => (
                  <button
                    key={`uploaded-${index}`}
                    onClick={() => addSticker(sticker)}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors overflow-hidden"
                    title={`Add uploaded sticker: ${sticker.name}`}
                  >
                    <img
                      src={sticker.src}
                      alt={sticker.name || 'Uploaded sticker'}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Frames Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Photo Frames</h3>
                <label className="text-xs bg-green-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-green-600 transition-colors">
                  Upload PNG
                  <input
                    type="file"
                    accept=".png,image/png"
                    multiple
                    onChange={handleFrameUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* No predefined frames - users upload their own PNG frames */}
                {/* Uploaded frames */}
                {uploadedFrames.map((frame, index) => (
                  <button
                    key={`uploaded-${index}`}
                    onClick={() => addFrame(frame)}
                    className="w-16 h-10 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors overflow-hidden"
                    title={`Add uploaded frame: ${frame.name}`}
                  >
                    <img
                      src={frame.src}
                      alt={frame.name || 'Uploaded frame'}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Backgrounds Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Backgrounds</h3>
                <label className="text-xs bg-purple-500 text-white px-2 py-1 rounded cursor-pointer hover:bg-purple-600 transition-colors">
                  Upload PNG
                  <input
                    type="file"
                    accept=".png,image/png"
                    multiple
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </label>
                {hasBackground && (
                  <button
                    onClick={clearBackground}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                    title="Clear background"
                  >
                    Clear BG
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* No predefined backgrounds - users upload their own */}
                {/* Uploaded backgrounds */}
                {uploadedBackgrounds.map((background, index) => (
                  <button
                    key={`uploaded-bg-${index}`}
                    onClick={() => addBackground(background)}
                    className="w-16 h-10 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors overflow-hidden border border-gray-300"
                    title={`Add uploaded background: ${background.name}`}
                  >
                    <img
                      src={background.src}
                      alt={background.name || 'Uploaded background'}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded Assets Info */}
            {(uploadedStickers.length > 0 || uploadedFrames.length > 0 || uploadedBackgrounds.length > 0) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Your Assets</h3>
                  <button
                    onClick={clearUploadedAssets}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                    title="Clear all uploaded assets"
                  >
                    Clear All
                  </button>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <span>Stickers: {uploadedStickers.length}</span>
                    <span>Frames: {uploadedFrames.length}</span>
                    <span>Backgrounds: {uploadedBackgrounds.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Layer Controls */}
            {selectedId && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Layer Controls</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => bringToFront(selectedId)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      Bring to Front
                    </button>
                    <button
                      onClick={() => sendToBack(selectedId)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                    >
                      Send to Back
                    </button>
                    <button
                      onClick={() => deleteElement(selectedId)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Rotation Control */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 min-w-12">Rotate:</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={rects.find(r => r.id === selectedId)?.rotation || 0}
                      onChange={(e) => {
                        const rotation = parseInt(e.target.value);
                        updateRect(selectedId, { rotation });
                      }}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="1"
                      value={rects.find(r => r.id === selectedId)?.rotation || 0}
                      onChange={(e) => {
                        const rotation = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
                        updateRect(selectedId, { rotation });
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Export */}
            <div className="flex justify-end">
              <button
                onClick={() => setThemesDialogOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save & Export Layout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-8">
        <div
          className="relative border-2 border-gray-400 bg-gray-100 shadow-lg mx-auto"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          onClick={(e) => {
            // Only deselect if clicking on the canvas itself, not on child elements
            if (e.target === e.currentTarget) {
              setSelectedId(null);
            }
          }}
        >
          {rects
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map(rect => (
            <DraggableRect
              key={rect.id}
              rect={rect}
              selected={selectedId === rect.id}
              onSelect={() => setSelectedId(rect.id)}
              onUpdate={(updates: Partial<PhotoRect>) => updateRect(rect.id, updates)}
              canvasWidth={CANVAS_WIDTH}
              canvasHeight={CANVAS_HEIGHT}
            />
          ))}
        </div>
      </div>

      {/* Themes Dialog */}
      <ThemesDialog
        open={themesDialogOpen}
        onOpenChange={setThemesDialogOpen}
        currentLayoutSchema={exportLayout() ? convertToLayoutTileSchema(exportLayout()) : null}
        onThemeChange={(themeId) => {
          // When a theme is selected, load it and navigate to gallery
          const selectedLayout = savedLayouts.find(l => l.id === themeId);
          if (selectedLayout) {
            setLayoutSchema(selectedLayout.schema);
            navigate('/');
          }
        }}
      />
    </div>
  );
};
