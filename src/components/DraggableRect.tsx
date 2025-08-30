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
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, rectX: 0, rectY: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [rotationStart, setRotationStart] = useState({ x: 0, y: 0, rotation: 0 });
    const [hasStartedDrag, setHasStartedDrag] = useState(false);

    // Helper function to calculate rotation angle from mouse position
    const calculateRotation = (mouseX: number, mouseY: number, centerX: number, centerY: number): number => {
      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      return (angle + 360) % 360; // Ensure positive angle between 0-360
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (isResizing || isRotating) return; // Don't start drag if we're resizing or rotating
      e.preventDefault(); // Prevent default browser behavior
      onSelect();
      setHasStartedDrag(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        rectX: rect.x,
        rectY: rect.y
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasStartedDrag) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only start dragging if mouse has moved more than 5 pixels
      if (!isDragging && distance > 5) {
        setIsDragging(true);
      }

      if (!isDragging) return;

      const newX = Math.max(0, Math.min(canvasWidth - rect.width, dragStart.rectX + deltaX));
      const newY = Math.max(0, Math.min(canvasHeight - rect.height, dragStart.rectY + deltaY));

      onUpdate({ x: newX, y: newY });
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect(); // Ensure the element is selected when resizing
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

    const handleRotationMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onSelect(); // Ensure the element is selected when rotating
      setIsRotating(true);
      setRotationStart({
        x: e.clientX,
        y: e.clientY,
        rotation: rect.rotation || 0
      });
    };

    const handleRotationMouseMove = (e: MouseEvent) => {
      if (!isRotating) return;

      // Prefer actual element bounding box for accurate center regardless of canvas offsets
      let centerX: number;
      let centerY: number;
      const el = wrapperRef.current;
      if (el) {
        const box = el.getBoundingClientRect();
        centerX = box.left + box.width / 2;
        centerY = box.top + box.height / 2;
      } else {
        // Fallback to logical center if ref not ready
        centerX = rect.x + rect.width / 2;
        centerY = rect.y + rect.height / 2;
      }

      const currentMouseX = e.clientX;
      const currentMouseY = e.clientY;
      const startMouseX = rotationStart.x;
      const startMouseY = rotationStart.y;

      const currentAngle = calculateRotation(currentMouseX, currentMouseY, centerX, centerY);
      const startAngle = calculateRotation(startMouseX, startMouseY, centerX, centerY);
      const deltaAngle = currentAngle - startAngle;
      const newRotation = (rotationStart.rotation + deltaAngle + 360) % 360;

      onUpdate({ rotation: Math.round(newRotation) });
    };

    React.useEffect(() => {
      if (hasStartedDrag) {
        const handleMouseUp = () => {
          setIsDragging(false);
          setHasStartedDrag(false);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [hasStartedDrag, isDragging, dragStart, rect.width, rect.height, canvasWidth, canvasHeight, onUpdate]);

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

    React.useEffect(() => {
      if (isRotating) {
        const handleMouseUp = () => setIsRotating(false);
        document.addEventListener('mousemove', handleRotationMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleRotationMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isRotating, rotationStart, rect.x, rect.y, rect.width, rect.height, onUpdate]);

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
            // No PNG frame uploaded - show placeholder like stickers
            return (
              <div className="flex items-center justify-center w-full h-full text-4xl">
                🖼️
              </div>
            );
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
                    backgroundColor: '#F3F4F6', // Default gray background
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

    // Background elements are not draggable but can be rotated
    if (rect.type === 'background') {
      return (
        <div
          ref={wrapperRef}
          className="absolute inset-0"
          style={{
            zIndex: rect.zIndex || 0,
            transform: `rotate(${(rect.rotation || 0)}deg)`,
            transformOrigin: 'center center',
          }}
          onMouseDown={onSelect}
        >
          {renderElementContent()}

          {/* Rotation handle for background */}
          {selected && (
            <div
              className="absolute top-4 left-1/2 w-4 h-4 bg-green-500 cursor-grab rounded-full border-2 border-white"
              onMouseDown={handleRotationMouseDown}
              style={{
                zIndex: 10,
                transform: `translate(-50%, 0)`,
                transformOrigin: 'center bottom'
              }}
              title="Rotate background"
            />
          )}
        </div>
      );
    }

    return (
      <motion.div
        ref={wrapperRef}
        className={`absolute cursor-move select-none ${
          rect.type === 'sticker' || rect.type === 'frame'
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
          transformOrigin: 'center center',
        }}
        animate={{ rotate: rect.rotation || 0 }}
        initial={false}
        onMouseDown={handleMouseDown}
        draggable={false}
      >
        {renderElementContent()}

        {/* Resize handle */}
        {selected && (
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
            style={{ zIndex: 10 }}
          />
        )}

        {/* Rotation handle */}
        {selected && (
          <div
            className="absolute -top-6 left-1/2 w-4 h-4 bg-green-500 cursor-grab rounded-full border-2 border-white"
            onMouseDown={handleRotationMouseDown}
            style={{
              zIndex: 10,
              transform: `translate(-50%, 0)`,
              transformOrigin: 'center bottom'
            }}
            title="Rotate element"
          />
        )}
      </motion.div>
    );
  };
  