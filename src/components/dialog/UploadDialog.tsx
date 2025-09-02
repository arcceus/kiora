import React, { useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { initializeTurboWithWalletKit } from '@/lib/turbo';
import { useApi, useConnection } from '@arweave-wallet-kit/react';
// import { ApiService } from '../../lib/api';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: () => void;
}

export const UploadDialog: React.FC<UploadDialogProps> = ({ open, onOpenChange, onUploadSuccess }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;

    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const api = useApi();
  const { connected } = useConnection()

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError('');
    setUploadProgress('Starting upload...');

    try {
      const { turbo, authenticated } = await initializeTurboWithWalletKit(api, connected);
      if (!authenticated) {
        throw new Error('Wallet not connected');
      }

      const authedTurbo = turbo as any;

      // Build unsigned data items for all files
      setUploadProgress('Preparing files for signing...');
      const unsignedItems = await Promise.all(selectedFiles.map(async (file) => {
        const data = new Uint8Array(await file.arrayBuffer());
        const contentType = file.type || 'application/octet-stream';
        const tags = [
          { name: 'Content-Type', value: contentType },
          { name: 'App-Name', value: 'the-something-gallery' },
          { name: 'File-Name', value: file.name }
        ];
        return { data, tags } as any;
      }));

      // Batch sign once if supported
      const wallet: any = (window as any).arweaveWallet;
      if (!wallet) throw new Error('ArConnect wallet not available');

      let signedItems: Uint8Array[] = [];
      if (typeof wallet.batchSignDataItem === 'function') {
        setUploadProgress('Awaiting wallet signature...');
        signedItems = await wallet.batchSignDataItem(unsignedItems);
      } else if (typeof wallet.signDataItem === 'function') {
        // Fallback: sign sequentially (may prompt per item depending on wallet)
        setUploadProgress('Signing files (wallet may prompt)...');
        for (let i = 0; i < unsignedItems.length; i++) {
          const signed = await wallet.signDataItem(unsignedItems[i]);
          signedItems.push(signed);
        }
      } else {
        throw new Error('Wallet does not support data item signing');
      }

      // Upload each signed data item without further signing prompts
      for (let i = 0; i < signedItems.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`${file.name}: Uploading...`);
        const arrayBuffer: ArrayBuffer = (signedItems[i] as any).buffer ?? (signedItems[i] as any);
        const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });

        const { id } = await authedTurbo.uploadSignedDataItem({
          dataItemStreamFactory: () => blob.stream(),
          dataItemSizeFactory: () => blob.size,
          events: {
            onUploadProgress: ({ totalBytes, processedBytes }: { totalBytes: number; processedBytes: number }) => {
              const pct = totalBytes ? Math.round((processedBytes / totalBytes) * 100) : 0;
              setUploadProgress(`${file.name}: Uploading ${pct}%`);
            },
            onUploadError: (error: unknown) => {
              console.error('Upload error:', error);
            },
            onUploadSuccess: () => {
              // no-op
            },
          },
        });

        console.log('Uploaded signed data item id:', id);
      }

      // Clear selected files and close dialog after successful upload
      setSelectedFiles([]);
      setIsUploading(false);
      setUploadProgress('All uploads complete');
      onOpenChange(false);
      onUploadSuccess?.();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Photos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isUploading
                ? 'border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-50'
                : isDragOver
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950 cursor-pointer'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 cursor-pointer'
              }
            `}
            onClick={() => !isUploading && document.getElementById('file-input')?.click()}
          >
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragOver ? 'Drop your photos here' : 'Drag & drop photos here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse files
            </p>
            <Button variant="outline" className="mb-4">
              Choose Files
            </Button>
            <p className="text-xs text-gray-400">
              Supports JPG, PNG, GIF up to 10MB each
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-blue-700 dark:text-blue-300">{uploadProgress}</span>
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="space-y-2">
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <span className="text-sm text-red-700 dark:text-red-300">{uploadError}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
