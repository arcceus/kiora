import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Save, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useGalleryStore } from '../../store/gallery';

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
  currentLayoutSchema?: any;
}

export const ThemesDialog: React.FC<ThemesDialogProps> = ({
  open,
  onOpenChange,
  currentTheme = 'default',
  onThemeChange,
  currentLayoutSchema
}) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [newThemeName, setNewThemeName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { savedLayouts, addSavedLayout, setLayoutSchema, removeSavedLayout } = useGalleryStore();

  // Convert saved layouts to themes
  const themes: Theme[] = savedLayouts.map(layout => ({
    id: layout.id,
    name: layout.name,
    preview: 'layout', // Could be enhanced with thumbnail generation
    description: `Custom layout with ${layout.schema.nodes.length} elements`
  }));

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
  };

  const handleApplyTheme = () => {
    const selectedLayout = savedLayouts.find(l => l.id === selectedTheme);
    if (selectedLayout) {
      setLayoutSchema(selectedLayout.schema);
      onThemeChange?.(selectedTheme);
    }
    onOpenChange(false);
  };

  const handleSaveCurrentLayout = () => {
    if (!newThemeName.trim() || !currentLayoutSchema) return;

    addSavedLayout(newThemeName, currentLayoutSchema);
    setNewThemeName('');
    setIsCreating(false);
  };

  const getPreviewIcon = (preview: string) => {
    // Simple preview representation using emojis for now
    const previews = {
      layout: '📐'
    };
    return previews[preview as keyof typeof previews] || '📐';
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
          {/* Save Current Layout */}
          <div className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center gap-3 mb-3">
              <Save className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium">Save Current Layout as Theme</h3>
            </div>
            {isCreating ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter theme name..."
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveCurrentLayout}
                    disabled={!newThemeName.trim()}
                  >
                    Save Theme
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewThemeName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Save your current layout design as a reusable theme
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsCreating(true)}
                  disabled={!currentLayoutSchema}
                >
                  Create Theme
                </Button>
              </div>
            )}
          </div>

          {/* Saved Themes */}
          {themes.length > 0 && (
            <>
              <div>
                <h3 className="font-medium mb-3">Your Saved Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themes.map((theme) => (
                    <motion.div
                      key={theme.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        relative group p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${selectedTheme === theme.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }
                      `}
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {/* Selection Indicator */}
                        {selectedTheme === theme.id && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSavedLayout(theme.id);
                            if (selectedTheme === theme.id) {
                              setSelectedTheme('');
                            }
                          }}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      {/* Theme Preview */}
                      <div className="text-6xl text-center mb-3">
                        {getPreviewIcon(theme.preview)}
                      </div>

                      {/* Theme Info */}
                      <h4 className="font-medium text-center mb-1">{theme.name}</h4>
                      <p className="text-sm text-gray-500 text-center">{theme.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {themes.length === 0 && !isCreating && (
            <div className="text-center py-8 text-gray-500">
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No saved themes yet. Create your first theme above!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyTheme}
              disabled={!selectedTheme || !savedLayouts.find(l => l.id === selectedTheme)}
            >
              Apply Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
