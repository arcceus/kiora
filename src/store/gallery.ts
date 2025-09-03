import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  rotation?: number;
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
  addPhoto: (photo: PhotoItem) => void;
  addPhotos: (photos: PhotoItem[]) => void;
  setScrollDirection: (dir: ScrollDirection) => void;
  setCustomBackground: (bg: string[]) => void;
  setLayoutSchema: (schema: LayoutTileSchema | null) => void;
  addSavedLayout: (name: string, schema: LayoutTileSchema) => void;
  removeSavedLayout: (id: string) => void;
  clearSavedLayouts: () => void;
  setCustomFrameStyle: (style: string[]) => void;
  setCustomStickers: (stickers: string[]) => void;
  refreshPhotos: () => Promise<void>;
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

// Load saved layouts from localStorage
const loadSavedLayouts = (): SavedLayout[] => {
  try {
    const saved = localStorage.getItem('savedLayouts');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load saved layouts:', error);
    return [];
  }
};

// Save layouts to localStorage
const saveSavedLayouts = (layouts: SavedLayout[]) => {
  try {
    localStorage.setItem('savedLayouts', JSON.stringify(layouts));
  } catch (error) {
    console.error('Failed to save layouts:', error);
  }
};

export const useGalleryStore = create<GalleryState>()(persist((set) => ({
  layout: 'grid',
  photos: placeholderPhotos,
  scrollDirection: 'vertical',
  customBackground: [],
  layoutSchema: null,
  savedLayouts: loadSavedLayouts(),
  customFrameStyle: [],
  customStickers: [],
  setLayout: (layout) => set({ layout }),
  setPhotos: (photos) => set({ photos }),
  addPhoto: (photo) => set((s) => ({ photos: [...s.photos, photo] })),
  addPhotos: (photos) => set((s) => ({ photos: [...s.photos, ...photos] })),
  setScrollDirection: (dir) => set({ scrollDirection: dir }),
  setCustomBackground: (bg) => set({ customBackground: bg }),
  setLayoutSchema: (schema) => set({ layoutSchema: schema }),
  addSavedLayout: (name, schema) => {
    // Sanitize schema before saving to avoid exceeding localStorage quota with large data URLs
    const sanitizeLayoutSchema = (input: LayoutTileSchema): LayoutTileSchema => {
      const cloned: LayoutTileSchema = {
        id: input.id,
        tileSize: { width: input.tileSize.width, height: input.tileSize.height },
        version: input.version,
        nodes: input.nodes.map((node) => {
          const sanitizedNode: LayoutNodeSchema = {
            id: node.id,
            frame: { x: node.frame.x, y: node.frame.y, width: node.frame.width, height: node.frame.height },
            zIndex: node.zIndex,
            type: node.type,
            caption: node.caption,
            aspectRatio: node.aspectRatio,
            rotation: node.rotation,
          };

          // Do NOT persist photo src on nodes; renderer uses photos[]
          // Remove or omit large data URLs for uploaded assets; keep name to rehydrate
          if (node.stickerData) {
            sanitizedNode.stickerData = {
              emoji: node.stickerData.emoji,
              // drop src to avoid storing base64
              src: undefined,
              color: node.stickerData.color,
              name: node.stickerData.name,
              isUploaded: node.stickerData.isUploaded,
            };
          }

          if (node.frameData) {
            sanitizedNode.frameData = {
              style: node.frameData.style,
              color: node.frameData.color,
              thickness: node.frameData.thickness,
              // drop src to avoid storing base64
              src: undefined,
              name: node.frameData.name,
              isUploaded: node.frameData.isUploaded,
            };
          }

          if (node.backgroundData) {
            sanitizedNode.backgroundData = {
              // keep empty string to satisfy typing, rehydrate later by name
              src: '',
              name: node.backgroundData.name,
              opacity: node.backgroundData.opacity,
              isUploaded: node.backgroundData.isUploaded,
            };
          }

          return sanitizedNode;
        })
      };
      return cloned;
    };

    const newLayout: SavedLayout = { id: `${Date.now()}`, name, schema: sanitizeLayoutSchema(schema) };
    set((s) => {
      const updatedLayouts = [...s.savedLayouts, newLayout];
      saveSavedLayouts(updatedLayouts);
      return { savedLayouts: updatedLayouts };
    });
  },
  removeSavedLayout: (id) => {
    set((s) => {
      const updatedLayouts = s.savedLayouts.filter(l => l.id !== id);
      saveSavedLayouts(updatedLayouts);
      return { savedLayouts: updatedLayouts };
    });
  },
  clearSavedLayouts: () => {
    saveSavedLayouts([]);
    set({ savedLayouts: [] });
  },
  setCustomFrameStyle: (style) => set({ customFrameStyle: style }),
  setCustomStickers: (stickers) => set({ customStickers: stickers }),
  refreshPhotos: async () => {
    try {
      const response = await fetch('http://localhost:4000/images');
      if (response.ok) {
        const images = await response.json();
        const photoItems: PhotoItem[] = images.map((img: any) => ({
          id: img.id,
          src: img.url,
          width: 800, // Default width, you might want to get actual dimensions
          height: 600, // Default height, you might want to get actual dimensions
          caption: img.title || img.description || 'Uploaded Image'
        }));
        set({ photos: photoItems });
      }
    } catch (error) {
      console.error('Failed to refresh photos:', error);
    }
  }
}), {
  name: 'gallery-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    photos: state.photos,
  }),
}));


