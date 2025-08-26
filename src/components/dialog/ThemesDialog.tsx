import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Plus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface Theme {
  id: string;
  name: string;
  preview: string;
  description: string;
}

interface ThemesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
}

export const ThemesDialog: React.FC<ThemesDialogProps> = ({
  open,
  onOpenChange,
  currentTheme = 'default',
  onThemeChange
}) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const themes: Theme[] = [
    {
      id: 'default',
      name: 'Classic Grid',
      preview: 'grid',
      description: 'Clean, minimalist grid layout'
    },
    {
      id: 'masonry',
      name: 'Masonry',
      preview: 'masonry',
      description: 'Pinterest-style cascading layout'
    },
    {
      id: 'polaroid',
      name: 'Polaroid',
      preview: 'polaroid',
      description: 'Retro polaroid photo style'
    },
    {
      id: 'scrapbook',
      name: 'Scrapbook',
      preview: 'scrapbook',
      description: 'Vintage scrapbook with decorative elements'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      preview: 'minimal',
      description: 'Ultra-clean, distraction-free'
    },
    {
      id: 'vintage',
      name: 'Vintage',
      preview: 'vintage',
      description: 'Warm, nostalgic aesthetic'
    }
  ];

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleApplyTheme = () => {
    onThemeChange?.(selectedTheme);
    onOpenChange(false);
  };

  const getPreviewIcon = (preview: string) => {
    // Simple preview representation using emojis for now
    const previews = {
      grid: '▦',
      masonry: '▥',
      polaroid: '📷',
      scrapbook: '📖',
      minimal: '▢',
      vintage: '📻'
    };
    return previews[preview as keyof typeof previews] || '▦';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Choose Theme
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <motion.div
                key={theme.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedTheme === theme.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }
                `}
                onClick={() => handleThemeSelect(theme.id)}
              >
                {/* Selection Indicator */}
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Theme Preview */}
                <div className="text-6xl text-center mb-3">
                  {getPreviewIcon(theme.preview)}
                </div>

                {/* Theme Info */}
                <h3 className="font-medium text-center mb-1">{theme.name}</h3>
                <p className="text-sm text-gray-500 text-center">{theme.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Custom Theme Button */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <Plus className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium mb-1">Create Custom Theme</p>
            <p className="text-sm text-gray-500 mb-3">
              Design your own unique layout and style
            </p>
            <Button variant="outline" size="sm">
              Create Theme
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTheme}>
              Apply Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
