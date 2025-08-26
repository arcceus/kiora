// src/components/GalleryView.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { UploadDialog } from './UploadDialog';
import { ThemesDialog } from './ThemesDialog';
import { CustomizeDialog } from './CustomizeDialog';
import { FavouritesDialog } from './FavouritesDialog';
import { BinDialog } from './BinDialog';
import { ExportDialog } from './ExportDialog';
import { ShareDialog } from './ShareDialog';

interface GalleryViewProps {
  children?: React.ReactNode;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ children }) => {
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

  const menuItems = [
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

  return (
    <div className="min-h-screen bg-black font-sans">
      
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
      <div className="relative z-10 px-6 py-12">
        {children ? children : (
          <>
            {/* Gallery Grid */}
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* <div className='aspect-square bg-black-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 flex items-center justify-center group cursor-pointer border border-black-800 hover:border-black-600 hover:bg-black-800'></div> */}
              </div>
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
