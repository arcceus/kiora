import { create } from 'zustand';

export type GalleryLayout = 'grid' | 'masonry' | 'polaroid' | 'timeline';
export type ScrollDirection = 'vertical' | 'horizontal';
export type GalleryBackground = 'black' | 'dark' | 'light' | 'white' | 'paper' | 'gradient';

export interface PhotoItem {
  id: string;
  src: string;
  width: number;
  height: number;
  caption?: string;
}

export interface LayoutNodeSchema {
  id: string;
  frame: { x: number; y: number; width: number; height: number };
  zIndex?: number;
  // Enhanced fields for version 2
  type?: 'photo' | 'sticker' | 'frame' | 'background';
  src?: string;
  caption?: string;
  aspectRatio?: { width: number; height: number };
  stickerData?: {
    emoji?: string;
    src?: string;
    color?: string;
    name?: string;
    isUploaded?: boolean;
  };
  frameData?: {
    style: 'simple' | 'rounded' | 'polaroid' | 'vintage';
    color?: string;
    thickness?: number;
    src?: string;
    name?: string;
    isUploaded?: boolean;
  };
  backgroundData?: {
    src: string;
    name?: string;
    opacity?: number;
    isUploaded?: boolean;
  };
}

export interface LayoutTileSchema {
  id: string;
  tileSize: { width: number; height: number };
  nodes: LayoutNodeSchema[];
  version: 1 | 2;
}

export interface SavedLayout {
  id: string;
  name: string;
  schema: LayoutTileSchema;
}

interface GalleryState {
  layout: GalleryLayout;
  photos: PhotoItem[];
  scrollDirection: ScrollDirection;
  customBackground: string[];
  layoutSchema: LayoutTileSchema | null;
  savedLayouts: SavedLayout[];
  customFrameStyle: string[];
  customStickers: string[];
  setLayout: (layout: GalleryLayout) => void;
  setPhotos: (photos: PhotoItem[]) => void;
  setScrollDirection: (dir: ScrollDirection) => void;
  setCustomBackground: (bg: string[]) => void;
  setLayoutSchema: (schema: LayoutTileSchema | null) => void;
  addSavedLayout: (name: string, schema: LayoutTileSchema) => void;
  removeSavedLayout: (id: string) => void;
  setCustomFrameStyle: (style: string[]) => void;
  setCustomStickers: (stickers: string[]) => void;
}

const placeholderPhotos: PhotoItem[] = [
  { id: 'p1', src: 'https://picsum.photos/id/1015/800/1200', width: 800, height: 1200, caption: 'River' },
  { id: 'p2', src: 'https://picsum.photos/id/1025/1200/800', width: 1200, height: 800, caption: 'Cat' },
  { id: 'p3', src: 'https://picsum.photos/id/1035/900/1200', width: 900, height: 1200, caption: 'Dog' },
  { id: 'p4', src: 'https://picsum.photos/id/1041/1200/900', width: 1200, height: 900, caption: 'City' },
  { id: 'p5', src: 'https://picsum.photos/id/1050/1000/1000', width: 1000, height: 1000, caption: 'Forest' },
  { id: 'p6', src: 'https://picsum.photos/id/1060/900/1400', width: 900, height: 1400, caption: 'Waterfall' }, 
  { id: 'p7', src: 'https://picsum.photos/id/1074/1200/900', width: 1200, height: 900, caption: 'Coastline' },
  { id: 'p8', src: 'https://picsum.photos/id/1084/900/900', width: 900, height: 900, caption: 'Abstract' },
  { id: 'p9', src: 'https://picsum.photos/id/1080/1200/1600', width: 1200, height: 1600, caption: 'Desert' },
  { id: 'p10', src: 'https://picsum.photos/id/109/1200/900', width: 1200, height: 900, caption: 'Bridge' },
  { id: 'p11', src: 'https://picsum.photos/id/110/900/1200', width: 900, height: 1200, caption: 'Dock' },
  { id: 'p12', src: 'https://picsum.photos/id/111/1000/700', width: 1000, height: 700, caption: 'River' },
  { id: 'p13', src: 'https://picsum.photos/id/112/1200/900', width: 1200, height: 900, caption: 'Mountain' },
  { id: 'p14', src: 'https://picsum.photos/id/113/900/1200', width: 900, height: 1200, caption: 'Forest' },
  { id: 'p15', src: 'https://picsum.photos/id/114/1000/1000', width: 1000, height: 1000, caption: 'Lake' },
  { id: 'p16', src: 'https://picsum.photos/id/115/1200/800', width: 1200, height: 800, caption: 'Beach' },
  { id: 'p17', src: 'https://picsum.photos/id/116/800/1200', width: 800, height: 1200, caption: 'River' },
  { id: 'p18', src: 'https://picsum.photos/id/117/900/1200', width: 900, height: 1200, caption: 'Desert' },
  { id: 'p19', src: 'https://picsum.photos/id/118/1000/700', width: 1000, height: 700, caption: 'City' },
  { id: 'p20', src: 'https://picsum.photos/id/119/700/1000', width: 700, height: 1000, caption: 'Skyline' },
  { id: 'p21', src: 'https://picsum.photos/id/120/1200/900', width: 1200, height: 900, caption: 'Mountain' },
  { id: 'p22', src: 'https://picsum.photos/id/121/900/1200', width: 900, height: 1200, caption: 'Forest' },
  { id: 'p23', src: 'https://picsum.photos/id/122/1000/1000', width: 1000, height: 1000, caption: 'Lake' },
  { id: 'p24', src: 'https://picsum.photos/id/123/1200/800', width: 1200, height: 800, caption: 'Beach' },
  { id: 'p25', src: 'https://picsum.photos/id/124/800/1200', width: 800, height: 1200, caption: 'River' },
  { id: 'p26', src: 'https://picsum.photos/id/125/900/1200', width: 900, height: 1200, caption: 'Desert' },
  { id: 'p27', src: 'https://picsum.photos/id/126/1000/700', width: 1000, height: 700, caption: 'City' },
  { id: 'p28', src: 'https://picsum.photos/id/127/700/1000', width: 700, height: 1000, caption: 'Skyline' },
  { id: 'p29', src: 'https://picsum.photos/id/128/1200/900', width: 1200, height: 900, caption: 'Mountain' },
  { id: 'p30', src: 'https://picsum.photos/id/129/900/1200', width: 900, height: 1200, caption: 'Forest' },
  { id: 'p31', src: 'https://picsum.photos/id/130/1000/1000', width: 1000, height: 1000, caption: 'Lake' },
  { id: 'p32', src: 'https://picsum.photos/id/131/1200/800', width: 1200, height: 800, caption: 'Beach' },
  { id: 'p33', src: 'https://picsum.photos/id/132/800/1200', width: 800, height: 1200, caption: 'River' },
  { id: 'p34', src: 'https://picsum.photos/id/133/900/1200', width: 900, height: 1200, caption: 'Desert' },
  { id: 'p35', src: 'https://picsum.photos/id/134/1000/700', width: 1000, height: 700, caption: 'City' },
  { id: 'p36', src: 'https://picsum.photos/id/135/700/1000', width: 700, height: 1000, caption: 'Skyline' },
  { id: 'p37', src: 'https://picsum.photos/id/136/1200/900', width: 1200, height: 900, caption: 'Mountain' },
  { id: 'p38', src: 'https://picsum.photos/id/137/900/1200', width: 900, height: 1200, caption: 'Forest' },
  { id: 'p39', src: 'https://picsum.photos/id/138/1000/1000', width: 1000, height: 1000, caption: 'Lake' },
  { id: 'p40', src: 'https://picsum.photos/id/139/1200/800', width: 1200, height: 800, caption: 'Beach' },
  { id: 'p41', src: 'https://picsum.photos/id/140/800/1200', width: 800, height: 1200, caption: 'River' },
  { id: 'p42', src: 'https://picsum.photos/id/141/900/1200', width: 900, height: 1200, caption: 'Desert' },
  { id: 'p43', src: 'https://picsum.photos/id/142/1000/700', width: 1000, height: 700, caption: 'City' },
  { id: 'p44', src: 'https://picsum.photos/id/143/700/1000', width: 700, height: 1000, caption: 'Skyline' },
  { id: 'p45', src: 'https://picsum.photos/id/144/1200/900', width: 1200, height: 900, caption: 'Mountain' },
  { id: 'p46', src: 'https://picsum.photos/id/145/900/1200', width: 900, height: 1200, caption: 'Forest' },
  { id: 'p47', src: 'https://picsum.photos/id/146/1000/1000', width: 1000, height: 1000, caption: 'Lake' },
  { id: 'p48', src: 'https://picsum.photos/id/147/1200/800', width: 1200, height: 800, caption: 'Beach' },
  { id: 'p49', src: 'https://picsum.photos/id/148/800/1200', width: 800, height: 1200, caption: 'River' },
  { id: 'p50', src: 'https://picsum.photos/id/149/900/1200', width: 900, height: 1200, caption: 'Desert' },
  { id: 'p51', src: 'https://picsum.photos/id/150/1000/700', width: 1000, height: 700, caption: 'City' },
];

export const useGalleryStore = create<GalleryState>((set) => ({
  layout: 'grid',
  photos: placeholderPhotos,
  scrollDirection: 'vertical',
  customBackground: [],
  layoutSchema: null,
  savedLayouts: [],
  customFrameStyle: [],
  customStickers: [],
  setLayout: (layout) => set({ layout }),
  setPhotos: (photos) => set({ photos })
  ,setScrollDirection: (dir) => set({ scrollDirection: dir })
  ,setCustomBackground: (bg) => set({ customBackground: bg })
  ,setLayoutSchema: (schema) => set({ layoutSchema: schema })
  ,addSavedLayout: (name, schema) => set((s) => ({ savedLayouts: [...s.savedLayouts, { id: `${Date.now()}`, name, schema }] }))
  ,removeSavedLayout: (id) => set((s) => ({ savedLayouts: s.savedLayouts.filter(l => l.id !== id) }))
  ,setCustomFrameStyle: (style) => set({ customFrameStyle: style })
  ,setCustomStickers: (stickers) => set({ customStickers: stickers })
}));


