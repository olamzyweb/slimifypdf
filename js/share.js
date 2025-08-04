// Share functionality
const APP_URL = window.location.origin;
const APP_NAME = 'SlimifyPDF';
const APP_DESCRIPTION = 'Fast, free, and secure PDF compression. Reduce file size by up to 90% while maintaining quality.';

// Share app with different platforms
function shareApp(platform) {
    const shareData = {
        title: APP_NAME,
        text: APP_DESCRIPTION,
        url: APP_URL
    };

    switch (platform) {
        case 'whatsapp':
            shareWhatsApp();
            break;
        case 'twitter':
            shareTwitter();
            break;
        case 'email':
            shareEmail();
            break;
        case 'general':
            shareGeneral();
            break;
        default:
            shareGeneral();
    }
}

// Share via WhatsApp
function shareWhatsApp() {
    const text = encodeURIComponent(`${APP_DESCRIPTION}\n\nTry it now: ${APP_URL}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    showToast('Opening WhatsApp...', 'success');
}

// Share via Twitter
function shareTwitter() {
    const text = encodeURIComponent(`${APP_DESCRIPTION}\n\nTry it now: ${APP_URL}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank');
    showToast('Opening Twitter...', 'success');
}

// Share via Email
function shareEmail() {
    const subject = encodeURIComponent(`Check out ${APP_NAME} - Fast PDF Compression`);
    const body = encodeURIComponent(`${APP_DESCRIPTION}\n\nTry it now: ${APP_URL}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(emailUrl);
    showToast('Opening email client...', 'success');
}

// General share (using Web Share API)
function shareGeneral() {
    if (navigator.share) {
        navigator.share({
            title: APP_NAME,
            text: APP_DESCRIPTION,
            url: APP_URL
        }).then(() => {
            showToast('Shared successfully!', 'success');
        }).catch((error) => {
            console.error('Error sharing:', error);
            copyLink();
        });
    } else {
        copyLink();
    }
}

// Copy link to clipboard
function copyLink() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(APP_URL).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch((error) => {
            console.error('Error copying to clipboard:', error);
            fallbackCopyLink();
        });
    } else {
        fallbackCopyLink();
    }
}

// Fallback copy link method
function fallbackCopyLink() {
    const textArea = document.createElement('textarea');
    textArea.value = APP_URL;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Link copied to clipboard!', 'success');
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showToast('Failed to copy link', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Share specific file
function shareFile(fileIndex) {
    const result = window.compressionResults ? window.compressionResults[fileIndex] : null;
    if (!result) {
        showToast('File not found', 'error');
        return;
    }

    const shareText = `I just compressed "${result.originalName}" and saved ${result.compressionRatio}% space using ${APP_NAME}!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Compressed File',
            text: shareText,
            url: APP_URL
        }).then(() => {
            showToast('Shared successfully!', 'success');
        }).catch((error) => {
            console.error('Error sharing file:', error);
            copyFileLink(result);
        });
    } else {
        copyFileLink(result);
    }
}

// Copy file link
function copyFileLink(result) {
    const fileInfo = `File: ${result.originalName}\nCompression: ${result.compressionRatio}% reduction\nApp: ${APP_URL}`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(fileInfo).then(() => {
            showToast('File info copied to clipboard!', 'success');
        }).catch((error) => {
            console.error('Error copying file info:', error);
            showToast('Failed to copy file info', 'error');
        });
    } else {
        showToast('File info copied to clipboard!', 'success');
    }
}

// Generate QR code for sharing
function generateQRCode(text) {
    // This would integrate with a QR code library
    // For now, we'll use a simple QR code service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    return qrUrl;
}

// Show QR code modal
function showQRCodeModal() {
    const qrUrl = generateQRCode(APP_URL);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div class="text-center">
                <h3 class="text-lg font-semibold mb-4">Scan to Share</h3>
                <img src="${qrUrl}" alt="QR Code" class="mx-auto mb-4">
                <p class="text-sm text-gray-600 mb-4">Scan this QR code to share ${APP_NAME}</p>
                <button onclick="this.closest('.fixed').remove()" 
                    class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Share with specific compression stats
function shareWithStats(originalSize, compressedSize, fileName) {
    const savings = originalSize - compressedSize;
    const savingsPercentage = Math.round((savings / originalSize) * 100);
    const savingsFormatted = formatFileSize(savings);
    
    const shareText = `I just compressed "${fileName}" and saved ${savingsFormatted} (${savingsPercentage}%) using ${APP_NAME}! Try it: ${APP_URL}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Compression Results',
            text: shareText,
            url: APP_URL
        }).then(() => {
            showToast('Shared successfully!', 'success');
        }).catch((error) => {
            console.error('Error sharing stats:', error);
            copyStats(shareText);
        });
    } else {
        copyStats(shareText);
    }
}

// Copy stats to clipboard
function copyStats(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Stats copied to clipboard!', 'success');
        }).catch((error) => {
            console.error('Error copying stats:', error);
            showToast('Failed to copy stats', 'error');
        });
    } else {
        showToast('Stats copied to clipboard!', 'success');
    }
}

// Format file size for sharing
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Social media sharing buttons
function createSocialButtons() {
    return `
        <div class="flex flex-wrap gap-3">
            <button onclick="shareApp('whatsapp')" 
                class="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <i class="fab fa-whatsapp mr-2"></i>
                WhatsApp
            </button>
            <button onclick="shareApp('twitter')" 
                class="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <i class="fab fa-twitter mr-2"></i>
                Twitter
            </button>
            <button onclick="shareApp('email')" 
                class="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                <i class="fas fa-envelope mr-2"></i>
                Email
            </button>
            <button onclick="copyLink()" 
                class="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                <i class="fas fa-link mr-2"></i>
                Copy Link
            </button>
            <button onclick="showQRCodeModal()" 
                class="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                <i class="fas fa-qrcode mr-2"></i>
                QR Code
            </button>
        </div>
    `;
}

// Initialize share functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add share buttons to pages that need them
    const shareContainers = document.querySelectorAll('[data-share-container]');
    shareContainers.forEach(container => {
        container.innerHTML = createSocialButtons();
    });
    
    // Add share buttons to compression results
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
        const shareSection = resultsSection.querySelector('.share-section');
        if (shareSection) {
            shareSection.innerHTML = createSocialButtons();
        }
    }
});

// Export functions for global use
window.shareApp = shareApp;
window.copyLink = copyLink;
window.shareFile = shareFile;
window.shareWithStats = shareWithStats;
window.showQRCodeModal = showQRCodeModal; 