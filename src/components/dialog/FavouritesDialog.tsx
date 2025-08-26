import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, Download, Share, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface FavouritePhoto {
  id: string;
  url: string;
  name: string;
  dateAdded: string;
  size: string;
}

interface FavouritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FavouritesDialog: React.FC<FavouritesDialogProps> = ({ open, onOpenChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  // Mock data - in real app this would come from props or context
  const [favouritePhotos] = useState<FavouritePhoto[]>([
    {
      id: '1',
      url: '/api/placeholder/200/200',
      name: 'Summer Beach',
      dateAdded: '2024-01-15',
      size: '2.4 MB'
    },
    {
      id: '2',
      url: '/api/placeholder/200/200',
      name: 'Mountain View',
      dateAdded: '2024-01-14',
      size: '3.1 MB'
    },
    {
      id: '3',
      url: '/api/placeholder/200/200',
      name: 'City Lights',
      dateAdded: '2024-01-13',
      size: '1.8 MB'
    }
  ]);

  const filteredPhotos = favouritePhotos.filter(photo =>
    photo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleRemoveFromFavourites = (photoId: string) => {
    console.log('Removing from favourites:', photoId);
    // In real app, this would update the favourites list
  };

  const handleDownload = () => {
    if (selectedPhotos.length === 0) return;
    console.log('Downloading photos:', selectedPhotos);
  };

  const handleShare = () => {
    if (selectedPhotos.length === 0) return;
    console.log('Sharing photos:', selectedPhotos);
  };

  const handleRemoveSelected = () => {
    if (selectedPhotos.length === 0) return;
    selectedPhotos.forEach(id => handleRemoveFromFavourites(id));
    setSelectedPhotos([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Favourites ({favouritePhotos.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search favourites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {selectedPhotos.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download ({selectedPhotos.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share className="w-4 h-4" />
                  Share ({selectedPhotos.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleRemoveSelected}>
                  <Trash2 className="w-4 h-4" />
                  Remove ({selectedPhotos.length})
                </Button>
              </div>
            )}
          </div>

          {/* Photos Grid */}
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">
                {searchTerm ? 'No photos found matching your search' : 'No favourite photos yet'}
              </p>
              <p className="text-sm text-gray-400">
                {searchTerm ? 'Try a different search term' : 'Start adding photos to your favourites!'}
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
                      ? 'border-blue-500 ring-2 ring-blue-200'
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
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Image</span>
                    </div>
                  </div>

                  {/* Selection Overlay */}
                  {selectedPhotos.includes(photo.id) && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavourites(photo.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Photo Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-sm font-medium truncate">{photo.name}</p>
                    <p className="text-white/70 text-xs">{photo.dateAdded}</p>
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
