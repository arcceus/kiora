import * as React from "react"
import { useState, useEffect } from 'react'
import { Image, Palette, Frame, Sticker, Upload } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { putAsset, getAllAssets } from '../lib/idb'
import { useTheme } from './theme-provider'
import { cn } from "@/lib/utils"

export type ElementType = 'photo' | 'sticker' | 'frame' | 'background'

export interface StickerData {
  emoji?: string
  src?: string
  color?: string
  name?: string
  isUploaded?: boolean
}

export interface FrameData {
  style: 'simple' | 'rounded' | 'polaroid' | 'vintage'
  color?: string
  thickness?: number
  src?: string
  name?: string
  isUploaded?: boolean
}

export interface BackgroundData {
  src: string
  name?: string
  opacity?: number
  isUploaded?: boolean
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  defaultStickers: StickerData[]
  defaultFrames: FrameData[]
  defaultBackgrounds: BackgroundData[]
  uploadedStickers: StickerData[]
  uploadedFrames: FrameData[]
  uploadedBackgrounds: BackgroundData[]
  onAddPhoto: () => void
  onAddPhotoWithRatio: (aspectRatio: { width: number; height: number }) => void
  onAddSticker: (stickerData: StickerData) => void
  onAddFrame: (frameData: FrameData) => void
  onAddBackground: (backgroundData: BackgroundData) => void
  onHandleStickerUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onHandleFrameUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onHandleBackgroundUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClearUploadedAssets: () => void
  onSaveLayout: () => void
  hasBackground: boolean
  onClearBackground: () => void
}

export function AppSidebar({
  defaultStickers,
  defaultFrames,
  defaultBackgrounds,
  uploadedStickers,
  uploadedFrames,
  uploadedBackgrounds,
  onAddPhoto,
  onAddPhotoWithRatio,
  onAddSticker,
  onAddFrame,
  onAddBackground,
  onHandleStickerUpload,
  onHandleFrameUpload,
  onHandleBackgroundUpload,
  onClearUploadedAssets,
  onSaveLayout,
  hasBackground,
  onClearBackground,
  ...props
}: AppSidebarProps) {
  const { theme } = useTheme()

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Image className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">Layout Editor</span>
            <span className="text-xs text-muted-foreground">Create your design</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Photos Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Image className="size-4" />
            Photos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onAddPhoto}
                className={cn(
                  "px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105",
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-600/40'
                )}
              >
                Add Photo
              </button>
              <button
                onClick={() => onAddPhotoWithRatio({ width: 16, height: 9 })}
                className={cn(
                  "px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105",
                  theme === 'dark'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/40'
                )}
                title="16:9 Landscape"
              >
                16:9
              </button>
              <button
                onClick={() => onAddPhotoWithRatio({ width: 4, height: 3 })}
                className={cn(
                  "px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105",
                  theme === 'dark'
                    ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-600/40'
                )}
                title="4:3 Standard"
              >
                4:3
              </button>
              <button
                onClick={() => onAddPhotoWithRatio({ width: 1, height: 1 })}
                className={cn(
                  "px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105",
                  theme === 'dark'
                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-600/40'
                )}
                title="1:1 Square"
              >
                1:1
              </button>
              <button
                onClick={() => onAddPhotoWithRatio({ width: 3, height: 4 })}
                className={cn(
                  "px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105",
                  theme === 'dark'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-600/40'
                )}
                title="3:4 Portrait"
              >
                3:4
              </button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Stickers Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Sticker className="size-4" />
            Stickers
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-3 mb-3">
              <label className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 transform hover:scale-105",
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25'
              )}>
                <Upload className="size-3 mr-1 inline" />
                Upload PNG
                <input
                  type="file"
                  accept=".png,image/png"
                  multiple
                  onChange={onHandleStickerUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Default stickers from layout packs */}
              {defaultStickers.map((sticker, index) => (
                <button
                  key={`default-${index}`}
                  onClick={() => onAddSticker(sticker)}
                  className={cn(
                    "w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-110",
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40'
                      : 'bg-slate-100 hover:bg-slate-200 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20'
                  )}
                  title={`Add sticker: ${sticker.name}`}
                >
                  <img
                    src={sticker.src}
                    alt={sticker.name || 'Sticker'}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
              {/* Uploaded stickers */}
              {uploadedStickers.map((sticker, index) => (
                <button
                  key={`uploaded-${index}`}
                  onClick={() => onAddSticker(sticker)}
                  className={cn(
                    "w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-110",
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40'
                      : 'bg-slate-100 hover:bg-slate-200 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20'
                  )}
                  title={`Add uploaded sticker: ${sticker.name}`}
                >
                  <img
                    src={sticker.src}
                    alt={sticker.name || 'Uploaded sticker'}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Frames Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Frame className="size-4" />
            Photo Frames
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-3 mb-3">
              <label className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 transform hover:scale-105",
                theme === 'dark'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25'
              )}>
                <Upload className="size-3 mr-1 inline" />
                Upload PNG
                <input
                  type="file"
                  accept=".png,image/png"
                  multiple
                  onChange={onHandleFrameUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Default frames from layout packs */}
              {defaultFrames.map((frame, index) => (
                <button
                  key={`default-${index}`}
                  onClick={() => onAddFrame(frame)}
                  className={cn(
                    "w-20 h-12 rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105",
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40'
                      : 'bg-slate-100 hover:bg-slate-200 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20'
                  )}
                  title={`Add frame: ${frame.name}`}
                >
                  <img
                    src={frame.src}
                    alt={frame.name || 'Frame'}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
              {/* Uploaded frames */}
              {uploadedFrames.map((frame, index) => (
                <button
                  key={`uploaded-${index}`}
                  onClick={() => onAddFrame(frame)}
                  className={cn(
                    "w-20 h-12 rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105",
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40'
                      : 'bg-slate-100 hover:bg-slate-200 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20'
                  )}
                  title={`Add uploaded frame: ${frame.name}`}
                >
                  <img
                    src={frame.src}
                    alt={frame.name || 'Uploaded frame'}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Backgrounds Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Palette className="size-4" />
            Backgrounds
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-3 mb-3">
              <label className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 transform hover:scale-105",
                theme === 'dark'
                  ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-500/25'
                  : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/25'
              )}>
                <Upload className="size-3 mr-1 inline" />
                Upload PNG
                <input
                  type="file"
                  accept=".png,image/png"
                  multiple
                  onChange={onHandleBackgroundUpload}
                  className="hidden"
                />
              </label>
              {hasBackground && (
                <button
                  onClick={onClearBackground}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200 transform hover:scale-105",
                    theme === 'dark'
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/25'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/25'
                  )}
                  title="Clear background"
                >
                  Clear BG
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Default backgrounds from layout packs */}
              {defaultBackgrounds.map((background, index) => (
                <button
                  key={`default-bg-${index}`}
                  onClick={() => onAddBackground(background)}
                  className={cn(
                    "w-20 h-12 rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 border-2",
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 border-slate-600'
                      : 'bg-slate-100 hover:bg-slate-200 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20 border-slate-300'
                  )}
                  title={`Add background: ${background.name}`}
                >
                  <img
                    src={background.src}
                    alt={background.name || 'Background'}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {/* Uploaded backgrounds */}
              {uploadedBackgrounds.map((background, index) => (
                <button
                  key={`uploaded-bg-${index}`}
                  onClick={() => onAddBackground(background)}
                  className={cn(
                    "w-20 h-12 rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 border-2",
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 border-slate-600'
                      : 'bg-slate-100 hover:bg-slate-200 shadow-md shadow-slate-900/10 hover:shadow-slate-900/20 border-slate-300'
                  )}
                  title={`Add uploaded background: ${background.name}`}
                >
                  <img
                    src={background.src}
                    alt={background.name || 'Uploaded background'}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Your Assets Section */}
        {(uploadedStickers.length > 0 || uploadedFrames.length > 0 || uploadedBackgrounds.length > 0) && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center justify-between">
              Your Assets
              <button
                onClick={onClearUploadedAssets}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200 transform hover:scale-105",
                  theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/25'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/25'
                )}
                title="Clear all uploaded assets"
              >
                Clear All
              </button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className={cn(
                "text-xs font-medium p-3 rounded-lg",
                theme === 'dark'
                  ? 'bg-slate-800/50 text-slate-300 border border-slate-700/50'
                  : 'bg-slate-50 text-slate-600 border border-slate-200'
              )}>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <span>Stickers: {uploadedStickers.length}</span>
                  <span>Frames: {uploadedFrames.length}</span>
                  <span>Backgrounds: {uploadedBackgrounds.length}</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <button
          onClick={onSaveLayout}
          className={cn(
            "w-full px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105",
            theme === 'dark'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/40'
          )}
        >
          Save & Export Layout
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
