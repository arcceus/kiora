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
}

export interface LayoutTileSchema {
  id: string;
  tileSize: { width: number; height: number };
  nodes: LayoutNodeSchema[];
  version: 1;
}

interface GalleryState {
  layout: GalleryLayout;
  photos: PhotoItem[];
  scrollDirection: ScrollDirection;
  background: GalleryBackground;
  layoutSchema: LayoutTileSchema | null;
  setLayout: (layout: GalleryLayout) => void;
  setPhotos: (photos: PhotoItem[]) => void;
  setScrollDirection: (dir: ScrollDirection) => void;
  setBackground: (bg: GalleryBackground) => void;
  setLayoutSchema: (schema: LayoutTileSchema | null) => void;
}

const placeholderPhotos: PhotoItem[] = [
  { id: 'p1', src: 'https://picsum.photos/id/1015/800/1200', width: 800, height: 1200, caption: 'Mountain view' },
  { id: 'p2', src: 'https://picsum.photos/id/1025/1200/800', width: 1200, height: 800, caption: 'Golden retriever' },
  { id: 'p3', src: 'https://picsum.photos/id/1035/900/1200', width: 900, height: 1200, caption: 'Forest path' },
  { id: 'p4', src: 'https://picsum.photos/id/1041/1200/900', width: 1200, height: 900, caption: 'City skyline' },
  { id: 'p5', src: 'https://picsum.photos/id/1050/1000/1000', width: 1000, height: 1000, caption: 'Square texture' },
  { id: 'p6', src: 'https://picsum.photos/id/1060/900/1400', width: 900, height: 1400, caption: 'Waterfall' },
  { id: 'p7', src: 'https://picsum.photos/id/1074/1200/900', width: 1200, height: 900, caption: 'Coastline' },
  { id: 'p8', src: 'https://picsum.photos/id/1084/900/900', width: 900, height: 900, caption: 'Abstract pattern' },
  { id: 'p9', src: 'https://picsum.photos/id/1080/1200/1600', width: 1200, height: 1600, caption: 'Desert dunes' },
  { id: 'p10', src: 'https://picsum.photos/id/109/1200/900', width: 1200, height: 900, caption: 'Bridge' },
  { id: 'p11', src: 'https://picsum.photos/id/110/900/1200', width: 900, height: 1200, caption: 'Dock' },
  { id: 'p12', src: 'https://picsum.photos/id/111/1000/700', width: 1000, height: 700, caption: 'River' }
];

export const useGalleryStore = create<GalleryState>((set) => ({
  layout: 'grid',
  photos: placeholderPhotos,
  scrollDirection: 'vertical',
  background: 'black',
  layoutSchema: null,
  setLayout: (layout) => set({ layout }),
  setPhotos: (photos) => set({ photos })
  ,setScrollDirection: (dir) => set({ scrollDirection: dir })
  ,setBackground: (bg) => set({ background: bg })
  ,setLayoutSchema: (schema) => set({ layoutSchema: schema })
}));


