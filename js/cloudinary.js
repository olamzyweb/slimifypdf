// Cloudinary integration for SlimifyPDF
class CloudinaryService {
    constructor() {
        this.baseUrl = '/api';
    }

    // Upload compressed file to Cloudinary
    async uploadFile(file, userId, fileName) {
        try {
            // Convert file to base64 for API
            const base64File = await this.fileToBase64(file);
            
            const response = await fetch(`${this.baseUrl}/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file: base64File,
                    userId: userId,
                    fileName: fileName
                })
            });

            const result = await response.json();
            
            if (result.success) {
                return {
                    url: result.url,
                    public_id: result.public_id,
                    size: result.size,
                    format: result.format
                };
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    }

    // Delete file from Cloudinary
    async deleteFile(publicId) {
        try {
            const response = await fetch(`${this.baseUrl}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    public_id: publicId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                return true;
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw error;
        }
    }

    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remove data:image/jpeg;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    // Get file info from URL
    getFileInfo(url) {
        try {
            const urlParts = url.split('/');
            const publicId = urlParts[urlParts.length - 1].split('.')[0];
            return {
                public_id: publicId,
                url: url
            };
        } catch (error) {
            console.error('Error parsing file info:', error);
            return null;
        }
    }
}

// Initialize Cloudinary service
const cloudinaryService = new CloudinaryService(); 