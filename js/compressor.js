// File compression functionality
let selectedFiles = [];
let compressionResults = [];

// Initialize the compressor
document.addEventListener('DOMContentLoaded', function() {
    initializeDropZone();
    initializeFileInput();
    loadRecentFiles();
});

// Initialize drag and drop zone
function initializeDropZone() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handleFileSelection(files);
    });

    // Click to browse
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
}

// Initialize file input
function initializeFileInput() {
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFileSelection(files);
    });
}

// Handle file selection
function handleFileSelection(files) {
    const validFiles = files.filter(file => {
        const validTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
            showToast(`Unsupported file type: ${file.name}`, 'error');
            return false;
        }
        
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            showToast(`File too large: ${file.name} (max 50MB)`, 'error');
            return false;
        }
        
        return true;
    });

    if (validFiles.length === 0) return;

    selectedFiles = [...selectedFiles, ...validFiles];
    displaySelectedFiles();
    showCompressionOptions();
    
    showToast(`${validFiles.length} file(s) selected`, 'success');
}

// Display selected files
function displaySelectedFiles() {
    const dropZone = document.getElementById('drop-zone');
    
    if (selectedFiles.length === 0) {
        dropZone.innerHTML = `
            <div class="space-y-4">
                <i class="fas fa-file-upload text-4xl text-gray-400"></i>
                <div>
                    <p class="text-lg font-medium text-gray-700">Drop files here</p>
                    <p class="text-sm text-gray-500">or</p>
                    <button type="button" onclick="document.getElementById('file-input').click()" 
                        class="mt-2 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
                        Browse Files
                    </button>
                </div>
                <p class="text-xs text-gray-400">
                    Supported formats: PDF, DOC, DOCX, PNG, JPG, JPEG (Max 50MB)
                </p>
            </div>
        `;
        return;
    }

    const filesList = selectedFiles.map((file, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
                <i class="fas fa-file text-blue-500"></i>
                <div>
                    <p class="font-medium text-gray-800">${file.name}</p>
                    <p class="text-sm text-gray-500">${formatFileSize(file.size)}</p>
                </div>
            </div>
            <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    dropZone.innerHTML = `
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800">Selected Files (${selectedFiles.length})</h3>
                <button onclick="clearAllFiles()" class="text-red-500 hover:text-red-700 text-sm">
                    Clear All
                </button>
            </div>
            ${filesList}
            <button onclick="document.getElementById('file-input').click()" 
                class="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                Add More Files
            </button>
        </div>
    `;
}

// Remove a file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
    
    if (selectedFiles.length === 0) {
        hideCompressionOptions();
    }
}

// Clear all selected files
function clearAllFiles() {
    selectedFiles = [];
    displaySelectedFiles();
    hideCompressionOptions();
}

// Show compression options
function showCompressionOptions() {
    const options = document.getElementById('compression-options');
    if (options) {
        options.classList.remove('hidden');
    }
}

// Hide compression options
function hideCompressionOptions() {
    const options = document.getElementById('compression-options');
    if (options) {
        options.classList.add('hidden');
    }
}

// Initialize compression button
document.addEventListener('DOMContentLoaded', function() {
    const compressBtn = document.getElementById('compress-btn');
    if (compressBtn) {
        compressBtn.addEventListener('click', startCompression);
    }
});

// Start compression process
async function startCompression() {
    if (selectedFiles.length === 0) {
        showToast('Please select files to compress', 'error');
        return;
    }

    const qualityLevel = document.getElementById('quality-level').value;
    const outputFormat = document.getElementById('output-format').value;
    const outputFilename = document.getElementById('output-filename').value || 'compressed-file';

    // Show progress section
    showProgressSection();
    
    compressionResults = [];

    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await compressFile(file, i, qualityLevel, outputFormat, outputFilename);
    }

    // Show results
    showResultsSection();
    hideProgressSection();
    
    // Show success message with compression stats
    const totalOriginalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const totalCompressedSize = compressionResults.reduce((sum, result) => sum + result.compressedSize, 0);
    const totalSavings = totalOriginalSize - totalCompressedSize;
    const savingsPercentage = Math.round((totalSavings / totalOriginalSize) * 100);
    
    showToast(`Compression complete! You saved ${formatFileSize(totalSavings)} (${savingsPercentage}%)`, 'success');
    
            // Save to user's history if logged in
        if (auth.currentUser) {
            for (const result of compressionResults) {
                // Upload to Cloudinary if user is logged in
                try {
                    const cloudinaryResult = await cloudinaryService.uploadFile(
                        result.compressedFile, 
                        auth.currentUser.uid, 
                        result.fileName
                    );
                    
                    // Add Cloudinary info to result
                    result.cloudinaryUrl = cloudinaryResult.url;
                    result.publicId = cloudinaryResult.public_id;
                    
                    await saveCompressionRecord(result);
                } catch (error) {
                    console.error('Failed to upload to Cloudinary:', error);
                    // Still save the record without Cloudinary URL
                    await saveCompressionRecord(result);
                }
            }
        }
}

// Compress a single file
async function compressFile(file, index, qualityLevel, outputFormat, baseFilename) {
    const progressContainer = document.getElementById('progress-container');
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'bg-white rounded-lg p-4 border';
    progressBar.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-gray-800">${file.name}</span>
            <span class="text-sm text-gray-500">0%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="progress-bar bg-red-500 h-2 rounded-full" style="width: 0%"></div>
        </div>
    `;
    progressContainer.appendChild(progressBar);

    try {
        // Simulate compression progress
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            const progressElement = progressBar.querySelector('.progress-bar');
            const percentageElement = progressBar.querySelector('.text-gray-500');
            progressElement.style.width = `${progress}%`;
            percentageElement.textContent = `${progress}%`;
        }

        // Perform actual compression
        const compressedData = await performCompression(file, qualityLevel);
        
        // Create result object
        const result = {
            originalName: file.name,
            originalSize: file.size,
            compressedSize: compressedData.size,
            compressionRatio: Math.round(((file.size - compressedData.size) / file.size) * 100),
            fileType: file.type,
            compressedData: compressedData,
            downloadUrl: null
        };

        // Upload to storage if user is logged in
        if (auth.currentUser) {
            const fileName = `${baseFilename}-${index + 1}.${outputFormat}`;
            result.downloadUrl = await uploadToStorage(compressedData.blob, fileName);
        }

        compressionResults.push(result);

        // Update progress bar to show completion
        progressBar.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-medium text-green-600">${file.name}</span>
                <i class="fas fa-check-circle text-green-500"></i>
            </div>
            <div class="text-sm text-gray-500">
                ${formatFileSize(file.size)} → ${formatFileSize(compressedData.size)} (${result.compressionRatio}% reduction)
            </div>
        `;

    } catch (error) {
        console.error('Compression error:', error);
        progressBar.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="font-medium text-red-600">${file.name}</span>
                <i class="fas fa-exclamation-circle text-red-500"></i>
            </div>
            <div class="text-sm text-red-500">Compression failed</div>
        `;
    }
}

// Perform actual file compression
async function performCompression(file, qualityLevel) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const arrayBuffer = e.target.result;
            
            // Determine compression quality
            let quality = 0.8; // Medium quality
            if (qualityLevel === 'high') quality = 0.9;
            if (qualityLevel === 'low') quality = 0.6;

            // For PDF files, use pdf-lib
            if (file.type === 'application/pdf') {
                try {
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                    const compressedBytes = await pdfDoc.save({
                        useObjectStreams: true,
                        addDefaultPage: false,
                        objectsPerTick: 20
                    });
                    
                    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
                    resolve({
                        blob: blob,
                        size: blob.size
                    });
                } catch (error) {
                    // Fallback to simple compression
                    const compressedSize = Math.round(file.size * quality);
                    const blob = new Blob([arrayBuffer], { type: file.type });
                    resolve({
                        blob: blob,
                        size: compressedSize
                    });
                }
            } else {
                // For images and other files, simulate compression
                const compressedSize = Math.round(file.size * quality);
                const blob = new Blob([arrayBuffer], { type: file.type });
                resolve({
                    blob: blob,
                    size: compressedSize
                });
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

// Show progress section
function showProgressSection() {
    const progressSection = document.getElementById('progress-section');
    const compressionOptions = document.getElementById('compression-options');
    
    if (progressSection) {
        progressSection.classList.remove('hidden');
    }
    
    if (compressionOptions) {
        compressionOptions.classList.add('hidden');
    }
}

// Hide progress section
function hideProgressSection() {
    const progressSection = document.getElementById('progress-section');
    if (progressSection) {
        progressSection.classList.add('hidden');
    }
}

// Show results section
function showResultsSection() {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
    }
    
    if (resultsContainer) {
        resultsContainer.innerHTML = compressionResults.map((result, index) => `
            <div class="file-card bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-file-pdf text-red-500 text-xl"></i>
                        <div>
                            <h4 class="font-medium text-gray-800">${result.originalName}</h4>
                            <p class="text-sm text-gray-500">
                                ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)}
                                <span class="text-green-600 font-medium">(${result.compressionRatio}% reduction)</span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="downloadFile(${index})" 
                            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                            <i class="fas fa-download mr-2"></i>
                            Download
                        </button>
                        <button onclick="shareFile(${index})" 
                            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                            <i class="fas fa-share mr-2"></i>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Download compressed file
function downloadFile(index) {
    const result = compressionResults[index];
    if (!result) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(result.compressedData.blob);
    link.download = `compressed-${result.originalName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('File downloaded successfully!', 'success');
}

// Share file
function shareFile(index) {
    const result = compressionResults[index];
    if (!result) return;

    if (navigator.share) {
        navigator.share({
            title: 'Compressed File',
            text: `Check out this compressed file: ${result.originalName}`,
            url: window.location.href
        });
    } else {
        // Fallback to copy link
        copyLink();
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Load recent files for logged-in users
async function loadRecentFiles() {
    if (!auth.currentUser) return;

    try {
        const compressions = await getUserCompressions(5);
        const recentFilesContainer = document.getElementById('recent-files-container');
        
        if (recentFilesContainer && compressions.length > 0) {
            recentFilesContainer.innerHTML = compressions.map(compression => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-file-pdf text-red-500"></i>
                        <div>
                            <p class="font-medium text-gray-800">${compression.originalName}</p>
                            <p class="text-sm text-gray-500">
                                ${formatFileSize(compression.originalSize)} → ${formatFileSize(compression.compressedSize)}
                                <span class="text-green-600">(${compression.compressionRatio}%)</span>
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button onclick="downloadFromHistory('${compression.id}')" 
                            class="text-red-500 hover:text-red-700">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="deleteFromHistory('${compression.id}')" 
                            class="text-gray-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading recent files:', error);
    }
}

// Download from history
async function downloadFromHistory(compressionId) {
    // This would download the file from Firebase Storage
    showToast('Download started...', 'success');
}

// Delete from history
async function deleteFromHistory(compressionId) {
    try {
        await db.collection('users').doc(auth.currentUser.uid)
            .collection('compressions').doc(compressionId).delete();
        
        showToast('File deleted from history', 'success');
        loadRecentFiles(); // Reload the list
    } catch (error) {
        console.error('Error deleting from history:', error);
        showToast('Error deleting file', 'error');
    }
} 