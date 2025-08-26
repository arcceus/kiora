// src/components/SimpleLayoutEditor.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleryStore } from '../store/gallery';
import { DraggableRect } from './DraggableRect';

export interface PhotoRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src?: string;
  caption?: string;
  aspectRatio?: { width: number; height: number };
}

export interface LayoutSchema {
  canvas: { width: number; height: number };
  rects: PhotoRect[];
}

export const SimpleLayoutEditor = () => {
  const navigate = useNavigate();
  const { setLayoutSchema } = useGalleryStore();
  const [rects, setRects] = useState<PhotoRect[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        zIndex: index
      })),
      version: 1 as const
    };
  };

  const addPhoto = () => {
    const newRect: PhotoRect = {
      id: Date.now().toString(),
      x: 50,
      y: 50,
      width: 100,
      height: 100,
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
    };
    setRects([...rects, newRect]);
  };

  const exportLayout = (): LayoutSchema => {
    return {
      canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      rects: rects
    };
  };

  const updateRect = (id: string, updates: Partial<PhotoRect>) => {
    setRects(rects.map(rect => 
      rect.id === id ? { ...rect, ...updates } : rect
    ));
  };

  return (
    <div className="flex flex-col">
      {/* Controls */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-2 mb-3">
          <button
            onClick={addPhoto}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <button
          onClick={() => {
            const layout = exportLayout();
            const tileSchema = convertToLayoutTileSchema(layout);
            setLayoutSchema(tileSchema);
            navigate('/');
          }}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
        >
          Export Layout
        </button>
      </div>

      {/* Canvas */}
      <div className="p-8">
        <div 
          className="relative border-2 border-gray-400 bg-gray-100"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        >
          {rects.map(rect => (
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
    </div>
  );
};
