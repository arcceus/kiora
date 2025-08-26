import React from 'react';
import type { LayoutTileSchema, PhotoItem } from '../store/gallery';

interface SchemaRendererProps {
  schema: LayoutTileSchema;
  photos: PhotoItem[];
  gap?: number;
  axis?: 'vertical' | 'horizontal';
}

const SchemaRenderer: React.FC<SchemaRendererProps> = ({ schema, photos, gap = 16, axis = 'vertical' }) => {
  const tile = (tileIndex: number) => {
    const scale = 1; // v1: 1:1 to 800x600; can compute based on container
    const startIndex = tileIndex * schema.nodes.length;
    return (
      <div
        key={`tile_${tileIndex}`}
        className="relative"
        style={{ width: schema.tileSize.width * scale, height: schema.tileSize.height * scale }}
      >
        {schema.nodes.map((n, i) => {
          const photo = photos[(startIndex + i) % photos.length];
          return (
            <div
              key={n.id}
              className="absolute overflow-hidden rounded-md border border-black-700 bg-black-900"
              style={{
                left: n.frame.x * scale,
                top: n.frame.y * scale,
                width: n.frame.width * scale,
                height: n.frame.height * scale,
                zIndex: n.zIndex ?? i,
              }}
            >
              <img src={photo.src} alt={photo.caption || 'Photo'} className="w-full h-full object-cover" />
            </div>
          );
        })}
      </div>
    );
  };

  const tilesToRender = 8; // simple non-virtualized v1

  return (
    <div className={axis === 'vertical' ? 'flex flex-col' : 'flex flex-row'} style={{ gap }}>
      {Array.from({ length: tilesToRender }).map((_, i) => tile(i))}
    </div>
  );
};

export default SchemaRenderer;


