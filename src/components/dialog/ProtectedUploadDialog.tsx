import React from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { UploadDialog } from './UploadDialog';

interface ProtectedUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUploadSuccess?: () => void;
}

export const ProtectedUploadDialog: React.FC<ProtectedUploadDialogProps> = ({
    open,
    onOpenChange,
    onUploadSuccess
}) => {
    return (
        <>
            <SignedIn>
                <UploadDialog
                    open={open}
                    onOpenChange={onOpenChange}
                    onUploadSuccess={onUploadSuccess}
                />
            </SignedIn>
            <SignedOut>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Authentication Required
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Please sign in to upload images to the gallery.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <SignInButton mode="modal">
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Sign In with Google
                                    </button>
                                </SignInButton>

                                <button
                                    onClick={() => onOpenChange(false)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </SignedOut>
        </>
    );
}; 