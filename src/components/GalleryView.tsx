// src/components/GalleryView.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Palette,
  Settings,
  FolderOpen,
  Heart,
  Trash2,
  Download,
  Share
} from 'lucide-react';
import { UploadDialog } from './dialog/UploadDialog';
import { ThemesDialog } from './dialog/ThemesDialog';
import { CustomizeDialog } from './dialog/CustomizeDialog';
import { FavouritesDialog } from './dialog/FavouritesDialog';
import { BinDialog } from './dialog/BinDialog';
import { ExportDialog } from './dialog/ExportDialog';
import { ShareDialog } from './dialog/ShareDialog';
import { useGalleryStore } from '../store/gallery';
import { SimpleLayoutRenderer } from './SimpleLayoutRenderer';
import { GridLayout } from './layouts/GridLayout';
import type { LayoutSchema, PhotoRect } from './SimpleLayoutEditor';
import { MasonryLayout } from './layouts/MasonryLayout';
import { PolaroidLayout } from './layouts/PolaroidLayout';
import { TimelineLayout } from './layouts/TimelineLayout';
import { ConnectButton } from "@arweave-wallet-kit/react";
import { initializeTurboWithWalletKit } from '../lib/turbo';
interface GalleryViewProps {
  children?: React.ReactNode;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dialog states
  const [uploadOpen, setUploadOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [favouritesOpen, setFavouritesOpen] = useState(false);
  const [binOpen, setBinOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Current theme state (for themes dialog)
  const [currentTheme, setCurrentTheme] = useState('default');

  const { layout, photos, background, scrollDirection, layoutSchema } = useGalleryStore();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Adapter functions to convert existing data structures to SimpleLayoutRenderer format
  const convertToLayoutSchema = (tileSchema: any): LayoutSchema => {
    return {
      canvas: { width: tileSchema.tileSize.width, height: tileSchema.tileSize.height },
      rects: tileSchema.nodes.map((node: any) => ({
        id: node.id,
        x: node.frame.x,
        y: node.frame.y,
        width: node.frame.width,
        height: node.frame.height,
      }))
    };
  };

  const convertToPhotoRects = (photoItems: any[]): PhotoRect[] => {
    return photoItems.map((photo) => ({
      id: photo.id,
      x: 0,
      y: 0,
      width: photo.width,
      height: photo.height,
      src: photo.src,
      caption: photo.caption,
    }));
  };


  const menuItems = [
    {
      icon: Settings,
      label: 'Builder',
      onClick: () => {
        navigate('/builder');
      }
    },
    {
      icon: Upload,
      label: 'Upload',
      onClick: () => setUploadOpen(true)
    },
    {
      icon: Palette,
      label: 'Themes',
      onClick: () => setThemesOpen(true)
    },
    {
      icon: Settings,
      label: 'Customize',
      onClick: () => setCustomizeOpen(true)
    },
    {
      icon: FolderOpen,
      label: 'Album',
      onClick: () => console.log('Album') // No dialog for Album as requested
    },
    {
      icon: Heart,
      label: 'Favourites',
      onClick: () => setFavouritesOpen(true)
    },
    {
      icon: Trash2,
      label: 'Bin',
      onClick: () => setBinOpen(true)
    },
    {
      icon: Download,
      label: 'Export',
      onClick: () => setExportOpen(true)
    },
    {
      icon: Share,
      label: 'Share',
      onClick: () => setShareOpen(true)
    },
  ];

  const handleMenuItemClick = (onClick: () => void) => {
    onClick();
    setIsMenuOpen(false);
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    console.log('Theme changed to:', themeId);
  };

  const backgroundClass = background === 'black' ? 'bg-black' 
    : background === 'dark' ? 'bg-zinc-950' 
    : background === 'light' ? 'bg-zinc-100' 
    : background === 'white' ? 'bg-white' 
    : background === 'paper' ? 'bg-[radial-gradient(circle_at_1px_1px,_#111_1px,_transparent_0)] [background-size:20px_20px]' 
    : 'bg-gradient-to-b from-black to-zinc-900';

  const scrollClass = scrollDirection === 'horizontal' ? 'overflow-x-auto whitespace-nowrap [scrollbar-width:none] snap-x snap-mandatory' : '';

  return (
    <div className={`min-h-screen ${backgroundClass} font-sans`}>
      <ConnectButton />
      {/* Top-Right Menu Button */}
      <div className="fixed top-6 right-6 z-50">
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated Hamburger Lines */}
          <motion.div
            className="w-6 h-0.5 bg-black"
            animate={{
              rotate: isMenuOpen ? 45 : 0,
              y: isMenuOpen ? 4 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="w-6 h-0.5 bg-black"
            animate={{
              opacity: isMenuOpen ? 0 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="w-6 h-0.5 bg-black"
            animate={{
              rotate: isMenuOpen ? -45 : 0,
              y: isMenuOpen ? -4 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25 
              }}
              className="absolute top-16 right-0 bg-black-900 rounded-2xl shadow-2xl border border-black-700 overflow-hidden min-w-[200px]"
            >
              <div className="py-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleMenuItemClick(item.onClick)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-black-800 transition-colors duration-200 text-left"
                  >
                    <item.icon className="w-5 h-5 text-black-400" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gallery Content */}
      <div className={`relative z-10 px-6 py-12 ${scrollClass}`}>
        {children ? children : (
          <>
            <div className="max-w-7xl mx-auto">
              {layoutSchema ? (
                <SimpleLayoutRenderer
                  schema={convertToLayoutSchema(layoutSchema)}
                  photos={convertToPhotoRects(photos)}
                  onOpenLightbox={setLightboxIndex}
                />
              ) : (
                <>
                  {layout === 'grid' && (<GridLayout photos={photos} onOpenLightbox={setLightboxIndex} />)}
                  {layout === 'masonry' && (<MasonryLayout photos={photos} onOpenLightbox={setLightboxIndex} />)}
                  {layout === 'polaroid' && (<PolaroidLayout photos={photos} onOpenLightbox={setLightboxIndex} />)}
                  {layout === 'timeline' && (<TimelineLayout photos={photos} onOpenLightbox={setLightboxIndex} />)}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Dialog Components */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <img
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].caption || 'Photo'}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <ThemesDialog
        open={themesOpen}
        onOpenChange={setThemesOpen}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
      />

      <CustomizeDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
      />

      <FavouritesDialog
        open={favouritesOpen}
        onOpenChange={setFavouritesOpen}
      />

      <BinDialog
        open={binOpen}
        onOpenChange={setBinOpen}
      />

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </div>
  );
};
