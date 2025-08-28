import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { PhotoRect } from './SimpleLayoutEditor';

export interface DraggableRectProps {
    rect: PhotoRect;
    selected: boolean;
    onSelect: () => void;
    onUpdate: (updates: Partial<PhotoRect>) => void;
    canvasWidth: number;
    canvasHeight: number;
  }


// DraggableRect component
export const DraggableRect: React.FC<DraggableRectProps> = ({
  rect,
  selected,
  onSelect,
  onUpdate,
  canvasWidth,
  canvasHeight
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, rectX: 0, rectY: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
      if (isResizing) return; // Don't start drag if we're resizing
      e.preventDefault(); // Prevent default browser behavior
      onSelect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        rectX: rect.x,
        rectY: rect.y
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const newX = Math.max(0, Math.min(canvasWidth - rect.width, dragStart.rectX + deltaX));
      const newY = Math.max(0, Math.min(canvasHeight - rect.height, dragStart.rectY + deltaY));

      onUpdate({ x: newX, y: newY });
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      });
    };

    const handleResizeMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      let newWidth = Math.max(50, Math.min(canvasWidth - rect.x, resizeStart.width + deltaX));
      let newHeight = Math.max(50, Math.min(canvasHeight - rect.y, resizeStart.height + deltaY));

      // If the rectangle has an aspect ratio, maintain it
      if (rect.aspectRatio) {
        const ratio = rect.aspectRatio.width / rect.aspectRatio.height;
        const currentRatio = newWidth / newHeight;

        // If the current ratio doesn't match the target ratio, adjust the dimensions
        if (Math.abs(currentRatio - ratio) > 0.01) {
          // Use the larger delta to determine which dimension to base the other on
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Base height on width
            newHeight = newWidth / ratio;
            // Ensure height doesn't exceed canvas bounds
            newHeight = Math.min(newHeight, canvasHeight - rect.y);
            newHeight = Math.max(newHeight, 50);
          } else {
            // Base width on height
            newWidth = newHeight * ratio;
            // Ensure width doesn't exceed canvas bounds
            newWidth = Math.min(newWidth, canvasWidth - rect.x);
            newWidth = Math.max(newWidth, 50);
          }
        }
      }

      onUpdate({ width: newWidth, height: newHeight });
    };

    React.useEffect(() => {
      if (isDragging) {
        const handleMouseUp = () => setIsDragging(false);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, dragStart, rect.width, rect.height, canvasWidth, canvasHeight, onUpdate]);

    React.useEffect(() => {
      if (isResizing) {
        const handleMouseUp = () => setIsResizing(false);
        document.addEventListener('mousemove', handleResizeMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleResizeMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isResizing, resizeStart, rect.x, rect.y, canvasWidth, canvasHeight, onUpdate]);

    const renderElementContent = () => {
      switch (rect.type) {
        case 'sticker':
          if (rect.stickerData?.src) {
            // Uploaded PNG sticker
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={rect.stickerData.src}
                  alt={rect.stickerData.name || 'Uploaded sticker'}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            );
          } else {
            // Emoji sticker
            return (
              <div className="flex items-center justify-center w-full h-full text-4xl">
                {rect.stickerData?.emoji || '🎨'}
              </div>
            );
          }

        case 'frame':
          if (rect.frameData?.src) {
            // Uploaded PNG frame
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={rect.frameData.src}
                  alt={rect.frameData.name || 'Uploaded frame'}
                  className="w-full h-full object-contain"
                />
              </div>
            );
          } else {
            // Predefined frame style
            const frameStyle = rect.frameData?.style;
            const frameColor = rect.frameData?.color || '#000000';
            const frameThickness = rect.frameData?.thickness || 4;

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
              {rect.backgroundData?.src && rect.backgroundData.src.trim() !== '' ? (
                <img
                  src={rect.backgroundData.src}
                  alt={rect.backgroundData.name || 'Background'}
                  className="w-full h-full object-cover absolute inset-0 select-none"
                  style={{
                    opacity: rect.backgroundData.opacity || 1,
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              ) : (
                <div
                  className="w-full h-full absolute inset-0"
                  style={{
                    backgroundColor: rect.backgroundData?.name === 'Solid Blue' ? '#3B82F6' :
                                   rect.backgroundData?.name === 'Solid Red' ? '#EF4444' :
                                   rect.backgroundData?.name === 'Solid Green' ? '#10B981' :
                                   rect.backgroundData?.name === 'Solid Yellow' ? '#F59E0B' : '#F3F4F6',
                    opacity: rect.backgroundData?.opacity || 1
                  }}
                />
              )}
            </div>
          );

        default: // photo
          return (
            <div className="relative w-full h-full overflow-hidden rounded">
              {rect.src ? (
                <img
                  src={rect.src}
                  alt={rect.caption || 'Photo'}
                  className="w-full h-full object-cover absolute inset-0 select-none"
                  style={{
                    userSelect: 'none',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-xs font-medium text-gray-600 bg-gray-200">
                  Photo
                </div>
              )}
            </div>
          );
      }
    };

    // Background elements are not draggable
    if (rect.type === 'background') {
      return (
        <div
          className="absolute inset-0"
          style={{
            zIndex: rect.zIndex || 0,
          }}
          onMouseDown={onSelect}
        >
          {renderElementContent()}
        </div>
      );
    }

    return (
      <motion.div
        className={`absolute cursor-move select-none ${
          rect.type === 'sticker'
            ? ''
            : `border-2 ${selected ? 'border-blue-500 bg-blue-100' : 'border-gray-500 bg-gray-300'}`
        }`}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
          zIndex: rect.zIndex || 0,
          userSelect: 'none',
        }}
        whileHover={{ scale: selected ? 1 : 1 }}
        whileTap={{ scale: 1 }}
        onMouseDown={handleMouseDown}
        draggable={false}
      >
        {renderElementContent()}

        {/* Resize handle */}
        {selected && rect.type !== 'sticker' && (
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
            style={{ zIndex: 10 }}
          />
        )}
      </motion.div>
    );
  };
  