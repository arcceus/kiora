const API_BASE_URL = 'http://localhost:4000';

export interface UploadResponse {
    success: boolean;
    image?: {
        id: string;
        url: string;
        title: string;
        arweaveTxId: string;
        uploadedAt: string;
    };
    error?: string;
}

export interface MultipleUploadResponse {
    success: boolean;
    results: Array<{
        success: boolean;
        image?: {
            id: string;
            url: string;
            title: string;
            arweaveTxId: string;
            uploadedAt: string;
        };
        filename?: string;
        error?: string;
    }>;
    summary: {
        total: number;
        successful: number;
        failed: number;
    };
}

export class ApiService {
    static async uploadSingleImage(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload-images`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed',
            };
        }
    }

    static async uploadMultipleImages(files: File[]): Promise<MultipleUploadResponse> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        try {
            const response = await fetch(`${API_BASE_URL}/upload-multiple-images`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Upload error:', error);
            return {
                success: false,
                results: [],
                summary: {
                    total: files.length,
                    successful: 0,
                    failed: files.length,
                },
            };
        }
    }

    static async getImages() {
        try {
            const response = await fetch(`${API_BASE_URL}/images`);
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch images error:', error);
            return [];
        }
    }
} 