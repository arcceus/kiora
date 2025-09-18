import * as React from "react"
import { Layers, RotateCcw, Info, Palette } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useTheme } from './theme-provider'
import { cn } from "@/lib/utils"

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

interface ControlSidebarProps extends React.ComponentProps<typeof Sidebar> {
  selectedId: string | null
  rects: PhotoRect[]
  canvasWidth: number
  canvasHeight: number
  onBringToFront: (id: string) => void
  onSendToBack: (id: string) => void
  onDeleteElement: (id: string) => void
  onUpdateRect: (id: string, updates: Partial<PhotoRect>) => void
}

export function ControlSidebar({
  selectedId,
  rects,
  canvasWidth,
  canvasHeight,
  onBringToFront,
  onSendToBack,
  onDeleteElement,
  onUpdateRect,
  ...props
}: ControlSidebarProps) {
  const { theme } = useTheme()

  const selectedRect = selectedId ? rects.find(r => r.id === selectedId) : null

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Layers className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">Controls</span>
            <span className="text-xs text-muted-foreground">Layer management</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Layer Controls */}
        {selectedId && selectedRect && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Layers className="size-4" />
              Layer Controls
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onBringToFront(selectedId)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-600/40'
                    }`}
                  >
                    Bring to Front
                  </button>
                  <button
                    onClick={() => onSendToBack(selectedId)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-600/40'
                    }`}
                  >
                    Send to Back
                  </button>
                  <button
                    onClick={() => onDeleteElement(selectedId)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-red-600/40'
                    }`}
                  >
                    Delete
                  </button>
                </div>

                {/* Rotation Control */}
                <div className={`p-3 rounded-lg space-y-3 ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border border-slate-700/50'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="size-4 text-muted-foreground" />
                    <label className={`text-sm font-medium min-w-12 transition-colors ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Rotate:
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={selectedRect.rotation || 0}
                      onChange={(e) => {
                        const rotation = parseInt(e.target.value);
                        onUpdateRect(selectedId, { rotation });
                      }}
                      className={`flex-1 ${
                        theme === 'dark'
                          ? 'accent-indigo-500'
                          : 'accent-indigo-600'
                      }`}
                    />
                    <input
                      type="number"
                      min="0"
                      max="360"
                      step="1"
                      value={selectedRect.rotation || 0}
                      onChange={(e) => {
                        const rotation = Math.max(0, Math.min(360, parseInt(e.target.value) || 0));
                        onUpdateRect(selectedId, { rotation });
                      }}
                      className={`w-16 px-2 py-1 text-sm rounded border transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-indigo-500'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                      }`}
                    />
                    <span className={`text-sm transition-colors ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      °
                    </span>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Selected Element Info */}
        {selectedId && selectedRect && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Info className="size-4" />
              Selected Element
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className={`text-sm p-3 rounded-lg ${
                theme === 'dark'
                  ? 'bg-slate-800/50 text-slate-300 border border-slate-700/50'
                  : 'bg-slate-50 text-slate-600 border border-slate-200'
              }`}>
                <div className="space-y-1">
                  <p><strong>Type:</strong> {selectedRect.type}</p>
                  <p><strong>Position:</strong> ({Math.round(selectedRect.x)}, {Math.round(selectedRect.y)})</p>
                  <p><strong>Size:</strong> {Math.round(selectedRect.width)} × {Math.round(selectedRect.height)}</p>
                  <p><strong>Rotation:</strong> {selectedRect.rotation || 0}°</p>
                  <p><strong>Z-Index:</strong> {selectedRect.zIndex || 0}</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Canvas Info */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Palette className="size-4" />
            Canvas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className={`text-sm p-3 rounded-lg ${
              theme === 'dark'
                ? 'bg-slate-800/50 text-slate-300 border border-slate-700/50'
                : 'bg-slate-50 text-slate-600 border border-slate-200'
            }`}>
              <div className="space-y-1">
                <p><strong>Size:</strong> {canvasWidth} × {canvasHeight}</p>
                <p><strong>Elements:</strong> {rects.length}</p>
                <p><strong>Selected:</strong> {selectedId ? 'Yes' : 'None'}</p>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
