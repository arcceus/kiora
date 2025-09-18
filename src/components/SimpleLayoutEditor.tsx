// src/components/SimpleLayoutEditor.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryStore } from '../store/gallery';
import { ThemesDialog } from './dialog/ThemesDialog';
import { putAsset, getAllAssets, clearAllStores } from '../lib/idb';
import { AppSidebar } from './app-sidebar';
import { ControlSidebar } from './control-sidebar';
import { CanvasArea } from './CanvasArea';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from './ui/sidebar';
import { Separator } from './ui/separator';

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
  const [defaultStickers, setDefaultStickers] = useState<StickerData[]>([]);
  const [defaultFrames, setDefaultFrames] = useState<FrameData[]>([]);
  const [defaultBackgrounds, setDefaultBackgrounds] = useState<BackgroundData[]>([]);
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

  // Load uploaded assets from localStorage and IndexedDB on component mount
  useEffect(() => {
    // Load default assets from project layouts folders using Vite's glob import
    try {
      const layoutsA = import.meta.glob('/src/layouts/**/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' }) as Record<string, string>;
      const layoutsB = import.meta.glob('/src/assets/layouts/**/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' }) as Record<string, string>;
      const allLayouts: Record<string, string> = { ...layoutsA, ...layoutsB };

      const discoveredBackgrounds: BackgroundData[] = [];
      const discoveredFrames: FrameData[] = [];
      const discoveredStickers: StickerData[] = [];

      Object.entries(allLayouts).forEach(([path, url]) => {
        const parts = path.split('/');
        const fileName = parts[parts.length - 1] || '';
        const base = fileName.replace(/\.[^.]+$/, '').toLowerCase();

        // Heuristics: background.* or bg.* => background
        // frame*, *frame* => frame
        // rest => sticker
        if (base === 'background' || base === 'bg' || base.includes('background')) {
          discoveredBackgrounds.push({ src: url, name: fileName, opacity: 1, isUploaded: false });
        } else if (base.startsWith('frame') || base.includes('frame')) {
          discoveredFrames.push({ style: 'simple', src: url, name: fileName, isUploaded: false });
        } else {
          discoveredStickers.push({ src: url, name: fileName, isUploaded: false });
        }
      });

      setDefaultBackgrounds(discoveredBackgrounds);
      setDefaultFrames(discoveredFrames);
      setDefaultStickers(discoveredStickers);
    } catch (e) {
      // If glob fails (e.g., folder not present), just keep defaults empty
      console.warn('No default layout assets discovered under src/layouts or src/assets/layouts');
    }

    const init = async () => {
      try {
        const savedStickers = JSON.parse(localStorage.getItem('uploadedStickers') || '[]');
        const savedFrames = JSON.parse(localStorage.getItem('uploadedFrames') || '[]');
        const savedBackgrounds = JSON.parse(localStorage.getItem('uploadedBackgrounds') || '[]');

        const [idbStickers, idbFrames, idbBackgrounds] = await Promise.all([
          getAllAssets('stickers'),
          getAllAssets('frames'),
          getAllAssets('backgrounds')
        ]);

        const stickersByName = new Map<string, string>();
        idbStickers.forEach(({ name, blob }) => stickersByName.set(name, URL.createObjectURL(blob)));
        const framesByName = new Map<string, string>();
        idbFrames.forEach(({ name, blob }) => framesByName.set(name, URL.createObjectURL(blob)));
        const bgsByName = new Map<string, string>();
        idbBackgrounds.forEach(({ name, blob }) => bgsByName.set(name, URL.createObjectURL(blob)));

        const mergedStickers: StickerData[] = (savedStickers as StickerData[]).map(s => ({
          ...s,
          src: s.name && stickersByName.has(s.name) ? (stickersByName.get(s.name) as string) : s.src
        }));
        const mergedFrames: FrameData[] = (savedFrames as FrameData[]).map(f => ({
          ...f,
          src: f.name && framesByName.has(f.name) ? (framesByName.get(f.name) as string) : f.src
        }));
        const mergedBackgrounds: BackgroundData[] = (savedBackgrounds as BackgroundData[]).map(b => ({
          ...b,
          src: b.name && bgsByName.has(b.name) ? (bgsByName.get(b.name) as string) : b.src
        }));

        setUploadedStickers(mergedStickers);
        setUploadedFrames(mergedFrames);
        setUploadedBackgrounds(mergedBackgrounds);
      } catch (e) {
        console.error('Failed to initialize uploaded assets:', e);
      }
    };
    void init();
  }, []);

  const validatePNGFile = (file: File): boolean => {
    return file.type === 'image/png' && file.size <= 5 * 1024 * 1024; // 5MB limit
  };

  const handleStickerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!validatePNGFile(file)) {
        alert(`${file.name} is not a valid PNG file or exceeds 5MB limit.`);
        continue;
      }

      const name = file.name.replace('.png', '');
      try {
        await putAsset('stickers', name, file);
        const objectUrl = URL.createObjectURL(file);
        const newSticker: StickerData = { src: objectUrl, name, isUploaded: true };
        const updatedStickers = [...uploadedStickers, newSticker];
        setUploadedStickers(updatedStickers);
        // Persist only light metadata in localStorage to avoid quota
        const meta = updatedStickers.map(s => ({ name: s.name, isUploaded: true }));
        localStorage.setItem('uploadedStickers', JSON.stringify(meta));
      } catch (e) {
        console.error('Failed to store sticker in IndexedDB:', e);
      }
    }

    // Reset input
    event.target.value = '';
  };

  const handleFrameUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!validatePNGFile(file)) {
        alert(`${file.name} is not a valid PNG file or exceeds 5MB limit.`);
        continue;
      }

      const name = file.name.replace('.png', '');
      try {
        await putAsset('frames', name, file);
        const objectUrl = URL.createObjectURL(file);
        const newFrame: FrameData = { style: 'simple', src: objectUrl, name, isUploaded: true };
        const updatedFrames = [...uploadedFrames, newFrame];
        setUploadedFrames(updatedFrames);
        const meta = updatedFrames.map(f => ({ style: f.style, name: f.name, isUploaded: true }));
        localStorage.setItem('uploadedFrames', JSON.stringify(meta));
      } catch (e) {
        console.error('Failed to store frame in IndexedDB:', e);
      }
    }

    // Reset input
    event.target.value = '';
  };

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!validatePNGFile(file)) {
        alert(`${file.name} is not a valid PNG file or exceeds 5MB limit.`);
        continue;
      }

      const name = file.name.replace('.png', '');
      try {
        await putAsset('backgrounds', name, file);
        const objectUrl = URL.createObjectURL(file);
        const newBackground: BackgroundData = { src: objectUrl, name, opacity: 1, isUploaded: true };
        const updatedBackgrounds = [...uploadedBackgrounds, newBackground];
        setUploadedBackgrounds(updatedBackgrounds);
        const meta = updatedBackgrounds.map(b => ({ name: b.name, opacity: b.opacity, isUploaded: true }));
        localStorage.setItem('uploadedBackgrounds', JSON.stringify(meta));
      } catch (e) {
        console.error('Failed to store background in IndexedDB:', e);
      }
    }

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
    // Also clear IndexedDB stores
    void clearAllStores();
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        defaultStickers={defaultStickers}
        defaultFrames={defaultFrames}
        defaultBackgrounds={defaultBackgrounds}
        uploadedStickers={uploadedStickers}
        uploadedFrames={uploadedFrames}
        uploadedBackgrounds={uploadedBackgrounds}
        onAddPhoto={addPhoto}
        onAddPhotoWithRatio={addPhotoWithRatio}
        onAddSticker={addSticker}
        onAddFrame={addFrame}
        onAddBackground={addBackground}
        onHandleStickerUpload={handleStickerUpload}
        onHandleFrameUpload={handleFrameUpload}
        onHandleBackgroundUpload={handleBackgroundUpload}
        onClearUploadedAssets={clearUploadedAssets}
        onSaveLayout={() => setThemesDialogOpen(true)}
        hasBackground={hasBackground}
        onClearBackground={clearBackground}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Layout Editor</span>
            <span className="text-xs text-muted-foreground">
              Canvas: {CANVAS_WIDTH} × {CANVAS_HEIGHT} • Elements: {rects.length}
                      </span>
              </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <CanvasArea
            rects={rects}
            selectedId={selectedId}
            canvasWidth={CANVAS_WIDTH}
            canvasHeight={CANVAS_HEIGHT}
            onCanvasClick={(e) => {
            // Only deselect if clicking on the canvas itself, not on child elements
            if (e.target === e.currentTarget) {
              setSelectedId(null);
            }
          }}
            onSelectElement={setSelectedId}
            onUpdateRect={updateRect}
            className="min-h-0"
          />
        </div>
      </SidebarInset>

      {/* Right Sidebar - Controls */}
      <ControlSidebar
        side="right"
        className="w-72"
        selectedId={selectedId}
        rects={rects}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
        onBringToFront={bringToFront}
        onSendToBack={sendToBack}
        onDeleteElement={deleteElement}
        onUpdateRect={updateRect}
      />

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
    </SidebarProvider>
  );
};
