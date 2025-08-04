// Dashboard functionality
let userStats = {};
let userCompressions = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadDashboardData();
        } else {
            // Redirect to login if not authenticated
            window.location.href = 'auth.html';
        }
    });
});

// Load dashboard data
async function loadDashboardData() {
    try {
        await Promise.all([
            loadUserStats(),
            loadUserCompressions(),
            updateWelcomeMessage()
        ]);
        
        updateDashboardUI();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('Error loading dashboard data', 'error');
    }
}

// Load user statistics
async function loadUserStats() {
    if (!auth.currentUser) return;

    try {
        const userDoc = await db.collection('users').doc(auth.currentUser.uid).get();
        if (userDoc.exists) {
            userStats = userDoc.data();
        } else {
            userStats = {
                totalFiles: 0,
                spaceSaved: 0,
                monthlyFiles: 0,
                avgReduction: 0
            };
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
        userStats = {
            totalFiles: 0,
            spaceSaved: 0,
            monthlyFiles: 0,
            avgReduction: 0
        };
    }
}

// Load user compressions
async function loadUserCompressions() {
    if (!auth.currentUser) return;

    try {
        const snapshot = await db.collection('users').doc(auth.currentUser.uid)
            .collection('compressions')
            .orderBy('compressedAt', 'desc')
            .limit(10)
            .get();

        userCompressions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error loading user compressions:', error);
        userCompressions = [];
    }
}

// Update welcome message
function updateWelcomeMessage() {
    const welcomeName = document.getElementById('welcome-name');
    if (welcomeName && auth.currentUser) {
        welcomeName.textContent = auth.currentUser.displayName || auth.currentUser.email.split('@')[0];
    }
}

// Update dashboard UI
function updateDashboardUI() {
    updateStatsCards();
    updateRecentFiles();
    updateAccountInfo();
}

// Update statistics cards
function updateStatsCards() {
    // Total files
    const totalFilesElement = document.getElementById('total-files');
    if (totalFilesElement) {
        totalFilesElement.textContent = userStats.totalFiles || 0;
    }

    // Space saved
    const spaceSavedElement = document.getElementById('space-saved');
    if (spaceSavedElement) {
        const spaceSaved = userStats.spaceSaved || 0;
        spaceSavedElement.textContent = formatFileSize(spaceSaved);
    }

    // Average reduction
    const avgReductionElement = document.getElementById('avg-reduction');
    if (avgReductionElement) {
        const avgReduction = userStats.avgReduction || 0;
        avgReductionElement.textContent = `${avgReduction}%`;
    }

    // Monthly files
    const monthlyFilesElement = document.getElementById('monthly-files');
    if (monthlyFilesElement) {
        monthlyFilesElement.textContent = userStats.monthlyFiles || 0;
    }
}

// Update recent files section
function updateRecentFiles() {
    const recentFilesContainer = document.getElementById('recent-files-container');
    
    if (!recentFilesContainer) return;

    if (userCompressions.length === 0) {
        recentFilesContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-file-pdf text-4xl mb-4"></i>
                <p>No files compressed yet</p>
                <button onclick="window.location.href='compressor.html'" 
                    class="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                    Start Compressing
                </button>
            </div>
        `;
        return;
    }

    recentFilesContainer.innerHTML = userCompressions.map(compression => `
        <div class="file-card bg-white rounded-lg p-4 border hover:shadow-lg transition-shadow">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-file-pdf text-red-500 text-xl"></i>
                    <div>
                        <h4 class="font-medium text-gray-800">${compression.originalName}</h4>
                        <p class="text-sm text-gray-500">
                            ${formatFileSize(compression.originalSize)} → ${formatFileSize(compression.compressedSize)}
                            <span class="text-green-600 font-medium">(${compression.compressionRatio}% reduction)</span>
                        </p>
                        <p class="text-xs text-gray-400">
                            ${formatDate(compression.compressedAt)}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${compression.downloadUrl ? `
                        <a href="${compression.downloadUrl}" target="_blank" 
                            class="text-red-500 hover:text-red-700">
                            <i class="fas fa-download"></i>
                        </a>
                    ` : ''}
                    <button onclick="deleteCompression('${compression.id}')" 
                        class="text-gray-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update account info
function updateAccountInfo() {
    // Storage used
    const storageUsedElement = document.getElementById('storage-used');
    if (storageUsedElement) {
        const storageUsed = userStats.spaceSaved || 0;
        storageUsedElement.textContent = formatFileSize(storageUsed);
    }

    // Files this month
    const filesThisMonthElement = document.getElementById('files-this-month');
    if (filesThisMonthElement) {
        filesThisMonthElement.textContent = userStats.monthlyFiles || 0;
    }
}

// Delete compression record
async function deleteCompression(compressionId) {
    try {
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Delete File?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            await db.collection('users').doc(auth.currentUser.uid)
                .collection('compressions').doc(compressionId).delete();
            
            showToast('File deleted successfully', 'success');
            loadDashboardData(); // Reload data
        }
    } catch (error) {
        console.error('Error deleting compression:', error);
        showToast('Error deleting file', 'error');
    }
}

// Load all files (for "View All" button)
async function loadAllFiles() {
    try {
        const snapshot = await db.collection('users').doc(auth.currentUser.uid)
            .collection('compressions')
            .orderBy('compressedAt', 'desc')
            .get();

        const allCompressions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Show in a modal or new page
        showAllFilesModal(allCompressions);
    } catch (error) {
        console.error('Error loading all files:', error);
        showToast('Error loading files', 'error');
    }
}

// Show all files modal
function showAllFilesModal(compressions) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">All Compressed Files</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="space-y-3">
                ${compressions.map(compression => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-file-pdf text-red-500"></i>
                            <div>
                                <p class="font-medium text-gray-800">${compression.originalName}</p>
                                <p class="text-sm text-gray-500">
                                    ${formatFileSize(compression.originalSize)} → ${formatFileSize(compression.compressedSize)}
                                    <span class="text-green-600">(${compression.compressionRatio}%)</span>
                                </p>
                                <p class="text-xs text-gray-400">${formatDate(compression.compressedAt)}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            ${compression.downloadUrl ? `
                                <a href="${compression.downloadUrl}" target="_blank" 
                                    class="text-red-500 hover:text-red-700">
                                    <i class="fas fa-download"></i>
                                </a>
                            ` : ''}
                            <button onclick="deleteCompression('${compression.id}')" 
                                class="text-gray-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Export user history
async function exportHistory() {
    try {
        const exportData = await exportUserData();
        if (!exportData) {
            showToast('No data to export', 'error');
            return;
        }

        // Create and download JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `slimifypdf-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Export completed successfully', 'success');
    } catch (error) {
        console.error('Error exporting history:', error);
        showToast('Error exporting data', 'error');
    }
}

// Upgrade plan (placeholder for future monetization)
function upgradePlan() {
    Swal.fire({
        title: 'Upgrade to Pro',
        text: 'Get unlimited compressions, priority support, and advanced features!',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Upgrade Now',
        cancelButtonText: 'Maybe Later'
    }).then((result) => {
        if (result.isConfirmed) {
            showToast('Upgrade feature coming soon!', 'info');
        }
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Refresh dashboard data
function refreshDashboard() {
    loadDashboardData();
}

// Auto-refresh dashboard every 30 seconds
setInterval(() => {
    if (auth.currentUser) {
        refreshDashboard();
    }
}, 30000);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + R to refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshDashboard();
    }
    
    // Ctrl/Cmd + N for new compression
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        window.location.href = 'compressor.html';
    }
}); 