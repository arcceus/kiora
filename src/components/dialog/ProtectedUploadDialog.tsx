import React from 'react';
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
    // For now, just show the upload dialog directly
    // You can implement your own authentication logic here
    return (
        <UploadDialog
            open={open}
            onOpenChange={onOpenChange}
            onUploadSuccess={onUploadSuccess}
        />
    );
}; 