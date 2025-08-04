// Firebase Configuration
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.email);
        updateUIForUser(user);
        loadUserData(user.uid);
    } else {
        // User is signed out
        console.log('User is signed out');
        updateUIForGuest();
    }
});

// Update UI for logged-in user
function updateUIForUser(user) {
    // Update navigation
    const authLink = document.getElementById('auth-link');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardLink = document.getElementById('dashboard-link');
    const mobileAuthLink = document.getElementById('mobile-auth-link');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const mobileUserName = document.getElementById('mobile-user-name');
    const mobileUserAvatar = document.getElementById('mobile-user-avatar');

    if (authLink) authLink.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (dashboardLink) dashboardLink.classList.remove('hidden');
    if (mobileAuthLink) mobileAuthLink.classList.add('hidden');
    if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
    if (mobileDashboardLink) mobileDashboardLink.classList.remove('hidden');
    if (userMenuBtn) userMenuBtn.classList.remove('hidden');
    
    // Update user info
    if (userName) userName.textContent = user.displayName || user.email.split('@')[0];
    if (mobileUserName) mobileUserName.textContent = user.displayName || user.email.split('@')[0];
    
    // Update avatar
    const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=ef4444&color=fff`;
    if (userAvatar) userAvatar.src = avatarUrl;
    if (mobileUserAvatar) mobileUserAvatar.src = avatarUrl;

    // Show recent files section on compressor page
    const recentFiles = document.getElementById('recent-files');
    if (recentFiles) recentFiles.classList.remove('hidden');
}

// Update UI for guest user
function updateUIForGuest() {
    const authLink = document.getElementById('auth-link');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardLink = document.getElementById('dashboard-link');
    const mobileAuthLink = document.getElementById('mobile-auth-link');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    const mobileDashboardLink = document.getElementById('mobile-dashboard-link');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const recentFiles = document.getElementById('recent-files');

    if (authLink) authLink.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (dashboardLink) dashboardLink.classList.add('hidden');
    if (mobileAuthLink) mobileAuthLink.classList.remove('hidden');
    if (mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');
    if (mobileDashboardLink) mobileDashboardLink.classList.add('hidden');
    if (userMenuBtn) userMenuBtn.classList.add('hidden');
    if (recentFiles) recentFiles.classList.add('hidden');
}

// Load user data from Firestore
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            // Store user data globally
            window.currentUserData = userData;
        } else {
            // Create new user document
            await db.collection('users').doc(userId).set({
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                totalFiles: 0,
                spaceSaved: 0,
                monthlyFiles: 0
            });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Save file compression record
async function saveCompressionRecord(fileData) {
    if (!auth.currentUser) return;

    try {
        const userId = auth.currentUser.uid;
        const compressionData = {
            originalName: fileData.originalName,
            originalSize: fileData.originalSize,
            compressedSize: fileData.compressedSize,
            compressionRatio: fileData.compressionRatio,
            fileType: fileData.fileType,
            compressedAt: firebase.firestore.FieldValue.serverTimestamp(),
            downloadUrl: fileData.downloadUrl || null,
            cloudinaryUrl: fileData.cloudinaryUrl || null,
            publicId: fileData.publicId || null
        };

        // Save to user's compressions collection
        await db.collection('users').doc(userId)
            .collection('compressions').add(compressionData);

        // Update user stats
        await updateUserStats(userId, fileData.originalSize, fileData.compressedSize);

    } catch (error) {
        console.error('Error saving compression record:', error);
    }
}

// Update user statistics
async function updateUserStats(userId, originalSize, compressedSize) {
    try {
        const userRef = db.collection('users').doc(userId);
        const spaceSaved = originalSize - compressedSize;

        await userRef.update({
            totalFiles: firebase.firestore.FieldValue.increment(1),
            spaceSaved: firebase.firestore.FieldValue.increment(spaceSaved),
            monthlyFiles: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Error updating user stats:', error);
    }
}

// Get user's compression history
async function getUserCompressions(limit = 10) {
    if (!auth.currentUser) return [];

    try {
        const userId = auth.currentUser.uid;
        const snapshot = await db.collection('users').doc(userId)
            .collection('compressions')
            .orderBy('compressedAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user compressions:', error);
        return [];
    }
}

// Upload file to Firebase Storage
async function uploadToStorage(file, fileName) {
    if (!auth.currentUser) return null;

    try {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`users/${auth.currentUser.uid}/${fileName}`);
        const snapshot = await fileRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error('Error uploading to storage:', error);
        return null;
    }
}

// Delete file from Firebase Storage
async function deleteFromStorage(fileName) {
    if (!auth.currentUser) return false;

    try {
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`users/${auth.currentUser.uid}/${fileName}`);
        await fileRef.delete();
        return true;
    } catch (error) {
        console.error('Error deleting from storage:', error);
        return false;
    }
}

// Delete file from Cloudinary
async function deleteFromCloudinary(publicId) {
    if (!auth.currentUser) return false;

    try {
        const response = await fetch('/api/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public_id: publicId
            })
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
}

// Export user data
async function exportUserData() {
    if (!auth.currentUser) return null;

    try {
        const userId = auth.currentUser.uid;
        const compressions = await getUserCompressions(1000); // Get all compressions
        
        const exportData = {
            user: {
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName
            },
            compressions: compressions,
            exportDate: new Date().toISOString()
        };

        return exportData;
    } catch (error) {
        console.error('Error exporting user data:', error);
        return null;
    }
} 
