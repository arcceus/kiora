import * as React from "react"
import { DraggableRect } from './DraggableRect'
import { cn } from "@/lib/utils"
import { useTheme } from './theme-provider'

export type ElementType = 'photo' | 'sticker' | 'frame' | 'background'

export interface PhotoRect {
  id: string
  x: number
  y: number
  width: number
  height: number
  src?: string
  caption?: string
  aspectRatio?: { width: number; height: number }
  type: ElementType
  zIndex?: number
  rotation?: number
}

interface CanvasAreaProps {
  rects: PhotoRect[]
  selectedId: string | null
  canvasWidth: number
  canvasHeight: number
  onCanvasClick: (e: React.MouseEvent) => void
  onSelectElement: (id: string) => void
  onUpdateRect: (id: string, updates: Partial<PhotoRect>) => void
  className?: string
}

export function CanvasArea({
  rects,
  selectedId,
  canvasWidth,
  canvasHeight,
  onCanvasClick,
  onSelectElement,
  onUpdateRect,
  className
}: CanvasAreaProps) {
  const { theme } = useTheme()

  // Calculate responsive canvas dimensions
  const aspectRatio = canvasWidth / canvasHeight // 1000/650 ≈ 1.538

  // Use a ref to measure the container
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    updateContainerSize()
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [])

  // Calculate the maximum canvas size that fits in the container with some padding
  const padding = 32 // equivalent to p-8 (32px on each side)
  const availableWidth = Math.max(400, containerSize.width - (padding * 2))
  const availableHeight = Math.max(300, containerSize.height - (padding * 2))

  // Scale canvas to fit within available space while maintaining aspect ratio
  const scaleByWidth = availableWidth / canvasWidth
  const scaleByHeight = availableHeight / canvasHeight
  const scale = Math.min(scaleByWidth, scaleByHeight, 1) // Don't scale up, only down

  const scaledWidth = canvasWidth * scale
  const scaledHeight = canvasHeight * scale

  return (
    <div
      ref={containerRef}
      className={cn("flex-1 flex items-center justify-center p-4 min-h-0", className)}
    >
      <div
        className={cn(
          "relative rounded-lg border-2 transition-all duration-300 shadow-2xl",
          theme === 'dark'
            ? 'border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/50'
            : 'border-slate-300 bg-gradient-to-br from-slate-50 to-white shadow-slate-900/20'
        )}
        style={{
          width: scaledWidth,
          height: scaledHeight,
          minWidth: Math.min(scaledWidth, 400), // Minimum width to prevent too small canvas
          minHeight: Math.min(scaledHeight, 300) // Minimum height to prevent too small canvas
        }}
        onClick={onCanvasClick}
      >
        {rects
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map(rect => (
          <DraggableRect
            key={rect.id}
            rect={rect}
            selected={selectedId === rect.id}
            onSelect={() => onSelectElement(rect.id)}
            onUpdate={(updates: Partial<PhotoRect>) => onUpdateRect(rect.id, updates)}
            canvasWidth={scaledWidth}
            canvasHeight={scaledHeight}
            scaleFactor={scale}
          />
        ))}

        {/* Canvas grid overlay for better element positioning */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Canvas center crosshairs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-current opacity-20 transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-current opacity-20 transform -translate-y-1/2" />
        </div>
      </div>
    </div>
  )
}
