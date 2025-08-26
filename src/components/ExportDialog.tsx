import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Image, FileImage, Settings, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = 'pdf' | 'zip' | 'jpg' | 'png';
type Quality = 'low' | 'medium' | 'high' | 'original';
type Size = 'small' | 'medium' | 'large' | 'original';

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onOpenChange }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [quality, setQuality] = useState<Quality>('high');
  const [size, setSize] = useState<Size>('original');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const formats = [
    {
      id: 'pdf' as const,
      name: 'PDF Document',
      description: 'Perfect for sharing or printing',
      icon: FileImage,
      extension: '.pdf'
    },
    {
      id: 'zip' as const,
      name: 'ZIP Archive',
      description: 'Download all photos as compressed files',
      icon: Download,
      extension: '.zip'
    },
    {
      id: 'jpg' as const,
      name: 'JPEG Images',
      description: 'High-quality compressed images',
      icon: Image,
      extension: '.jpg'
    },
    {
      id: 'png' as const,
      name: 'PNG Images',
      description: 'Lossless quality with transparency',
      icon: Image,
      extension: '.png'
    }
  ];

  const qualities = [
    { id: 'low' as const, name: 'Low (Fast)', size: '~500KB', description: 'Smaller file, lower quality' },
    { id: 'medium' as const, name: 'Medium', size: '~2MB', description: 'Balanced quality and size' },
    { id: 'high' as const, name: 'High', size: '~5MB', description: 'Best quality, larger files' },
    { id: 'original' as const, name: 'Original', size: 'Varies', description: 'Uncompressed, highest quality' }
  ];

  const sizes = [
    { id: 'small' as const, name: 'Small (800px)', description: 'Perfect for web sharing' },
    { id: 'medium' as const, name: 'Medium (1500px)', description: 'Good for most uses' },
    { id: 'large' as const, name: 'Large (2500px)', description: 'High resolution for printing' },
    { id: 'original' as const, name: 'Original Size', description: 'Keep original dimensions' }
  ];

  const handleExport = async () => {
    setIsExporting(true);

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Exporting with settings:', {
      format: selectedFormat,
      quality,
      size,
      includeMetadata
    });

    setIsExporting(false);
    onOpenChange(false);
  };

  const selectedFormatData = formats.find(f => f.id === selectedFormat);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {formats.map((format) => (
                <div
                  key={format.id}
                  className={`
                    p-3 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <format.icon className="w-5 h-5" />
                    <span className="font-medium">{format.name}</span>
                    {selectedFormat === format.id && (
                      <Check className="w-4 h-4 text-blue-500 ml-auto" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{format.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Selection (for image formats) */}
          {(selectedFormat === 'jpg' || selectedFormat === 'png') && (
            <div className="space-y-3">
              <h3 className="font-medium">Quality</h3>
              <div className="space-y-2">
                {qualities.map((q) => (
                  <div
                    key={q.id}
                    className={`
                      p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${quality === q.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setQuality(q.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{q.name}</p>
                        <p className="text-sm text-gray-500">{q.description}</p>
                      </div>
                      <span className="text-sm text-gray-400">{q.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection (for image formats) */}
          {(selectedFormat === 'jpg' || selectedFormat === 'png') && (
            <div className="space-y-3">
              <h3 className="font-medium">Size</h3>
              <div className="space-y-2">
                {sizes.map((s) => (
                  <div
                    key={s.id}
                    className={`
                      p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${size === s.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }
                    `}
                    onClick={() => setSize(s.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-sm text-gray-500">{s.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-3">
            <h3 className="font-medium">Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="font-medium">Include metadata</p>
                  <p className="text-sm text-gray-500">Embed photo details and timestamps</p>
                </div>
              </label>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Format:</span> {selectedFormatData?.name}</p>
              <p><span className="font-medium">File:</span> MyGallery{selectedFormatData?.extension}</p>
              {(selectedFormat === 'jpg' || selectedFormat === 'png') && (
                <>
                  <p><span className="font-medium">Quality:</span> {qualities.find(q => q.id === quality)?.name}</p>
                  <p><span className="font-medium">Size:</span> {sizes.find(s => s.id === size)?.name}</p>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Gallery
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
