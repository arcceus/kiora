import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, X, AlertTriangle, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface DeletedPhoto {
  id: string;
  url: string;
  name: string;
  dateDeleted: string;
  originalLocation: string;
  size: string;
  daysUntilPermanent: number;
}

interface BinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BinDialog: React.FC<BinDialogProps> = ({ open, onOpenChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Mock data - in real app this would come from props or context
  const [deletedPhotos] = useState<DeletedPhoto[]>([
    {
      id: '1',
      url: '/api/placeholder/200/200',
      name: 'Old Photo',
      dateDeleted: '2024-01-10',
      originalLocation: 'Main Gallery',
      size: '1.2 MB',
      daysUntilPermanent: 7
    },
    {
      id: '2',
      url: '/api/placeholder/200/200',
      name: 'Duplicate Image',
      dateDeleted: '2024-01-08',
      originalLocation: 'Summer Album',
      size: '2.8 MB',
      daysUntilPermanent: 9
    }
  ]);

  const filteredPhotos = deletedPhotos.filter(photo =>
    photo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleRestore = (photoId: string) => {
    console.log('Restoring photo:', photoId);
    // In real app, this would restore the photo to its original location
  };

  const handlePermanentDelete = (photoId: string) => {
    console.log('Permanently deleting photo:', photoId);
    // In real app, this would permanently delete the photo from Arweave
  };

  const handleRestoreSelected = () => {
    if (selectedPhotos.length === 0) return;
    selectedPhotos.forEach(id => handleRestore(id));
    setSelectedPhotos([]);
  };

  const handleDeleteSelected = () => {
    if (selectedPhotos.length === 0) return;
    selectedPhotos.forEach(id => handlePermanentDelete(id));
    setSelectedPhotos([]);
  };

  const handleEmptyBin = () => {
    console.log('Emptying entire bin');
    // In real app, this would permanently delete all photos
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Recycle Bin ({deletedPhotos.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Photos in bin will be permanently deleted
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Photos in the recycle bin will be permanently deleted after 30 days or when you empty the bin.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search deleted photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {selectedPhotos.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRestoreSelected}>
                  <RotateCcw className="w-4 h-4" />
                  Restore ({selectedPhotos.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                  <X className="w-4 h-4" />
                  Delete ({selectedPhotos.length})
                </Button>
              </div>
            )}

            {deletedPhotos.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleEmptyBin}>
                Empty Bin
              </Button>
            )}
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">
                {searchTerm ? 'No photos found matching your search' : 'Recycle bin is empty'}
              </p>
              <p className="text-sm text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Deleted photos will appear here'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`
                    relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                    ${selectedPhotos.includes(photo.id)
                      ? 'border-red-500 ring-2 ring-red-200'
                      : 'border-transparent hover:border-gray-300'
                    }
                  `}
                  onClick={() => handlePhotoSelect(photo.id)}
                >
                  {/* Photo */}
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover opacity-60"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Image</span>
                    </div>
                  </div>

                  {/* Selection Overlay */}
                  {selectedPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(photo.id);
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 bg-red-500/80 hover:bg-red-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePermanentDelete(photo.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Photo Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-sm font-medium truncate">{photo.name}</p>
                    <p className="text-white/70 text-xs">{photo.dateDeleted}</p>
                    <p className="text-red-300 text-xs">
                      {photo.daysUntilPermanent} days left
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
