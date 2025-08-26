import React, { useState } from 'react';
import { Share, Copy, Link, QrCode, Twitter, Facebook, Instagram, MessageSquare, Check, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ShareMethod = 'link' | 'qr' | 'social' | 'embed';

export const ShareDialog: React.FC<ShareDialogProps> = ({ open, onOpenChange }) => {
  const [activeMethod, setActiveMethod] = useState<ShareMethod>('link');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Mock share URL - in real app this would be generated dynamically
  const shareUrl = 'https://permagallery.app/gallery/shared/abc123def456';
  const embedCode = `<iframe src="${shareUrl}" width="800" height="600" frameborder="0"></iframe>`;

  const shareMethods = [
    {
      id: 'link' as const,
      name: 'Share Link',
      description: 'Get a shareable link to your gallery',
      icon: Link
    },
    {
      id: 'qr' as const,
      name: 'QR Code',
      description: 'Generate a QR code for easy sharing',
      icon: QrCode
    },
    {
      id: 'social' as const,
      name: 'Social Media',
      description: 'Share directly to social platforms',
      icon: Share
    },
    {
      id: 'embed' as const,
      name: 'Embed Code',
      description: 'Get embed code for websites',
      icon: MessageSquare
    }
  ];

  const socialPlatforms = [
    { name: 'Twitter', icon: Twitter, color: 'bg-blue-400' },
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { name: 'Instagram', icon: Instagram, color: 'bg-pink-500' }
  ];

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = 'Check out my amazing photo gallery!';
    const url = shareUrl;

    let shareUrlPlatform = '';

    switch (platform) {
      case 'Twitter':
        shareUrlPlatform = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'Facebook':
        shareUrlPlatform = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'Instagram':
        // Instagram doesn't support direct web sharing, so we'll copy the link
        handleCopyToClipboard(url);
        return;
      default:
        return;
    }

    window.open(shareUrlPlatform, '_blank', 'width=600,height=400');
  };

  const renderShareContent = () => {
    switch (activeMethod) {
      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Shareable Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                />
                <Button
                  onClick={() => handleCopyToClipboard(shareUrl)}
                  variant="outline"
                  className="px-4"
                >
                  {copiedToClipboard ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Link Settings
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span>Allow public access</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Require password</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Set expiration date</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'qr':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 mx-auto rounded-lg flex items-center justify-center">
                {/* Placeholder for QR code */}
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                QR Code will be generated for your gallery
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => handleCopyToClipboard(shareUrl)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-3">Share to Social Media</label>
              <div className="grid grid-cols-3 gap-3">
                {socialPlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleSocialShare(platform.name)}
                    className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className={`w-12 h-12 ${platform.color} rounded-full flex items-center justify-center`}>
                      <platform.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block text-sm font-medium mb-2">Custom Message</label>
              <textarea
                placeholder="Add a personal message..."
                className="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                defaultValue="Check out my amazing photo gallery!"
              />
            </div>
          </div>
        );

      case 'embed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Embed Code</label>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 font-mono text-sm resize-none"
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyToClipboard(embedCode)}
                >
                  {copiedToClipboard ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Embed Options</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block font-medium mb-1">Width</label>
                  <input
                    type="text"
                    defaultValue="800px"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Height</label>
                  <input
                    type="text"
                    defaultValue="600px"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
                  />
                </div>
              </div>
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
            <Share className="w-5 h-5" />
            Share Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Method Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {shareMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setActiveMethod(method.id)}
                className={`
                  p-3 border-2 rounded-lg text-center transition-all
                  ${activeMethod === method.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <method.icon className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">{method.name}</p>
              </button>
            ))}
          </div>

          {/* Share Content */}
          <div className="min-h-[200px]">
            {renderShareContent()}
          </div>

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
