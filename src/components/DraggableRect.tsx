import React, { useState } from 'react';
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
export const DraggableRect: React.FC<DraggableRectProps> = ({ rect, selected, onSelect, onUpdate, canvasWidth, canvasHeight }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, rectX: 0, rectY: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
    const handleMouseDown = (e: React.MouseEvent) => {
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
  
    return (
      <div
        className={`absolute border-2 bg-gray-300 cursor-move flex items-center justify-center text-xs font-medium ${
          selected ? 'border-blue-500 bg-blue-100' : 'border-gray-500'
        }`}
        style={{
          left: rect.x,
          top: rect.y,
          width: rect.width,
          height: rect.height,
        }}
        onMouseDown={handleMouseDown}
      >
        Photo
        
        {/* Resize handle */}
        {selected && (
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          />
        )}
      </div>
    );
  };
  