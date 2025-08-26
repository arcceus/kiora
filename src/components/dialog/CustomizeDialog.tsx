import React, { useEffect, useState } from 'react';
import { Settings, Scroll, PaintBucket } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useGalleryStore } from '../../store/gallery';
import type { GalleryLayout, ScrollDirection, GalleryBackground, SavedLayout } from '../../store/gallery';

interface CustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CustomizationTab = 'layout' | 'scroll' | 'background';

export const CustomizeDialog: React.FC<CustomizeDialogProps> = ({ open, onOpenChange }) => {
  const { layout: currentLayout, scrollDirection: currentScroll, background: currentBg, savedLayouts, frameStyle, setLayout, setScrollDirection, setBackground, setLayoutSchema, setFrameStyle } = useGalleryStore();
  const [activeTab, setActiveTab] = useState<CustomizationTab>('layout');
  const [customizations, setCustomizations] = useState<{ layout: GalleryLayout; scroll: ScrollDirection; background: GalleryBackground }>({
    layout: currentLayout,
    scroll: currentScroll,
    background: currentBg
  });

  useEffect(() => {
    if (open) {
      setCustomizations({ layout: currentLayout, scroll: currentScroll, background: currentBg });
    }
  }, [open, currentLayout, currentScroll, currentBg]);

  const tabs = [
    { id: 'layout' as const, label: 'Layout', icon: Settings },
    { id: 'scroll' as const, label: 'Scroll', icon: Scroll },
    { id: 'background' as const, label: 'Background', icon: PaintBucket }
  ];

  const layoutOptions: { id: GalleryLayout; name: string; preview: string }[] = [
    { id: 'grid', name: 'Grid', preview: '▦▦▦' },
    { id: 'masonry', name: 'Masonry', preview: '▥▥▥' },
    { id: 'polaroid', name: 'Polaroid', preview: '📷📷📷' },
    { id: 'timeline', name: 'Timeline', preview: '📅📅📅' }
  ];

  const scrollOptions: { id: ScrollDirection; name: string }[] = [
    { id: 'vertical', name: 'Vertical' },
    { id: 'horizontal', name: 'Horizontal' }
  ];

  const backgroundOptions: { id: GalleryBackground; name: string }[] = [
    { id: 'black', name: 'Black' },
    { id: 'dark', name: 'Dark' },
    { id: 'light', name: 'Light' },
    { id: 'white', name: 'White' },
    { id: 'paper', name: 'Paper' },
    { id: 'gradient', name: 'Gradient' }
  ];

  const handleApplyCustomizations = () => {
    setLayout(customizations.layout);
    setScrollDirection(customizations.scroll);
    setBackground(customizations.background);
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
                  onClick={() => {
                    setLayout(option.id);
                    setLayoutSchema(null);
                    setCustomizations(prev => ({ ...prev, layout: option.id }));
                  }}
                >
                  <div className="text-2xl text-center mb-2">{option.preview}</div>
                  <p className="text-sm text-center font-medium">{option.name}</p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Saved Custom Layouts</h4>
              {savedLayouts.length === 0 && (
                <p className="text-sm text-gray-500">No saved layouts yet.</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {savedLayouts.map((l: SavedLayout) => (
                  <button
                    key={l.id}
                    className="p-2 border-2 rounded-lg text-left hover:border-blue-500"
                    onClick={() => {
                      setLayoutSchema(l.schema);
                    }}
                  >
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-xs text-gray-500">{l.schema.nodes.length} frames</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Photo Frame</h4>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-md border ${frameStyle === 'square' ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => setFrameStyle('square')}
                >
                  Normal
                </button>
                <button
                  className={`px-3 py-1 rounded-md border ${frameStyle === 'rounded' ? 'border-blue-500' : 'border-gray-300'}`}
                  onClick={() => setFrameStyle('rounded')}
                >
                  Rounded
                </button>
              </div>
            </div>
          </div>
        );

      case 'scroll':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Scroll Direction</h3>
            <div className="grid grid-cols-2 gap-3">
              {scrollOptions.map((option) => (
                <div
                  key={option.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all text-center
                    ${customizations.scroll === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setCustomizations(prev => ({ ...prev, scroll: option.id }))}
                >
                  <p className="text-sm font-medium">{option.name}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'background':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Background</h3>
            <div className="grid grid-cols-3 gap-3">
              {backgroundOptions.map((option) => (
                <div
                  key={option.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all text-center
                    ${customizations.background === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setCustomizations(prev => ({ ...prev, background: option.id }))}
                >
                  <p className="text-sm font-medium">{option.name}</p>
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
