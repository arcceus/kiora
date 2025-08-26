import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Type, Sticker, Palette, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface CustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CustomizationTab = 'layout' | 'decorations' | 'text' | 'effects';

export const CustomizeDialog: React.FC<CustomizeDialogProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState<CustomizationTab>('layout');
  const [customizations, setCustomizations] = useState({
    layout: 'grid',
    decorations: [] as string[],
    text: '',
    effects: [] as string[]
  });

  const tabs = [
    { id: 'layout' as const, label: 'Layout', icon: Settings },
    { id: 'decorations' as const, label: 'Decorations', icon: Sticker },
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'effects' as const, label: 'Effects', icon: Sparkles }
  ];

  const layoutOptions = [
    { id: 'grid', name: 'Grid', preview: '▦▦▦' },
    { id: 'masonry', name: 'Masonry', preview: '▥▥▥' },
    { id: 'polaroid', name: 'Polaroid', preview: '📷📷📷' },
    { id: 'timeline', name: 'Timeline', preview: '📅📅📅' }
  ];

  const decorations = [
    { id: 'flowers', name: 'Flowers', emoji: '🌸' },
    { id: 'hearts', name: 'Hearts', emoji: '💖' },
    { id: 'stars', name: 'Stars', emoji: '⭐' },
    { id: 'stickers', name: 'Stickers', emoji: '🎀' },
    { id: 'frames', name: 'Frames', emoji: '🖼️' },
    { id: 'borders', name: 'Borders', emoji: '🔲' }
  ];

  const effects = [
    { id: 'vintage', name: 'Vintage', description: 'Warm, retro filter' },
    { id: 'blur', name: 'Blur', description: 'Soft focus effect' },
    { id: 'sepia', name: 'Sepia', description: 'Classic brown tone' },
    { id: 'polaroid', name: 'Polaroid', description: 'Instant photo style' },
    { id: 'grunge', name: 'Grunge', description: 'Edgy, textured look' }
  ];

  const handleApplyCustomizations = () => {
    console.log('Applying customizations:', customizations);
    onOpenChange(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layout':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Choose Layout Style</h3>
            <div className="grid grid-cols-2 gap-3">
              {layoutOptions.map((option) => (
                <div
                  key={option.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${customizations.layout === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setCustomizations(prev => ({ ...prev, layout: option.id }))}
                >
                  <div className="text-2xl text-center mb-2">{option.preview}</div>
                  <p className="text-sm text-center font-medium">{option.name}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'decorations':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Add Decorative Elements</h3>
            <div className="grid grid-cols-3 gap-3">
              {decorations.map((decoration) => (
                <div
                  key={decoration.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all text-center
                    ${customizations.decorations.includes(decoration.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => {
                    setCustomizations(prev => ({
                      ...prev,
                      decorations: prev.decorations.includes(decoration.id)
                        ? prev.decorations.filter(d => d !== decoration.id)
                        : [...prev.decorations, decoration.id]
                    }));
                  }}
                >
                  <div className="text-2xl mb-2">{decoration.emoji}</div>
                  <p className="text-sm font-medium">{decoration.name}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Add Text Overlay</h3>
            <div className="space-y-3">
              <textarea
                placeholder="Enter your text overlay..."
                value={customizations.text}
                onChange={(e) => setCustomizations(prev => ({ ...prev, text: e.target.value }))}
                className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Font Style</Button>
                <Button variant="outline" size="sm">Position</Button>
                <Button variant="outline" size="sm">Color</Button>
              </div>
            </div>
          </div>
        );

      case 'effects':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Apply Visual Effects</h3>
            <div className="space-y-2">
              {effects.map((effect) => (
                <div
                  key={effect.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${customizations.effects.includes(effect.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => {
                    setCustomizations(prev => ({
                      ...prev,
                      effects: prev.effects.includes(effect.id)
                        ? prev.effects.filter(e => e !== effect.id)
                        : [...prev.effects, effect.id]
                    }));
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{effect.name}</p>
                      <p className="text-sm text-gray-500">{effect.description}</p>
                    </div>
                    <div className="text-2xl">
                      {effect.id === 'vintage' && '📻'}
                      {effect.id === 'blur' && '🌫️'}
                      {effect.id === 'sepia' && '🟫'}
                      {effect.id === 'polaroid' && '📷'}
                      {effect.id === 'grunge' && '🎨'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Customize Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyCustomizations}>
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
