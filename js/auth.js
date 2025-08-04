// Authentication functionality
let currentForm = 'login';

// Tab switching functionality
function switchToSignup() {
    currentForm = 'signup';
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('login-tab').classList.remove('bg-white', 'text-gray-900');
    document.getElementById('login-tab').classList.add('text-gray-500');
    document.getElementById('signup-tab').classList.add('bg-white', 'text-gray-900');
    document.getElementById('signup-tab').classList.remove('text-gray-500');
}

function switchToLogin() {
    currentForm = 'login';
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-tab').classList.remove('bg-white', 'text-gray-900');
    document.getElementById('signup-tab').classList.add('text-gray-500');
    document.getElementById('login-tab').classList.add('bg-white', 'text-gray-900');
    document.getElementById('login-tab').classList.remove('text-gray-500');
}

// Tab click handlers
document.getElementById('login-tab').addEventListener('click', switchToLogin);
document.getElementById('signup-tab').addEventListener('click', switchToSignup);

// Form submission handlers
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('signup-form').addEventListener('submit', handleSignup);

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    try {
        showLoading('Signing in...');
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Successfully signed in!', 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'An error occurred during sign in';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/user-disabled':
                errorMessage = 'This account has been disabled';
                break;
        }
        
        showToast(errorMessage, 'error');
    } finally {
        hideLoading();
    }
}

// Signup handler
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('Please agree to the terms and conditions', 'error');
        return;
    }

    try {
        showLoading('Creating your account...');
        
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        showToast('Account created successfully!', 'success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'An error occurred during sign up';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email address';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak';
                break;
        }
        
        showToast(errorMessage, 'error');
    } finally {
        hideLoading();
    }
}

// Social authentication
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        showLoading('Signing in with Google...');
        
        const result = await auth.signInWithPopup(provider);
        
        showToast('Successfully signed in with Google!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('Google sign-in error:', error);
        showToast('Failed to sign in with Google', 'error');
    } finally {
        hideLoading();
    }
}

async function signInWithGithub() {
    try {
        const provider = new firebase.auth.GithubAuthProvider();
        showLoading('Signing in with GitHub...');
        
        const result = await auth.signInWithPopup(provider);
        
        showToast('Successfully signed in with GitHub!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        console.error('GitHub sign-in error:', error);
        showToast('Failed to sign in with GitHub', 'error');
    } finally {
        hideLoading();
    }
}

// Logout functionality
function logout() {
    auth.signOut().then(() => {
        showToast('Successfully signed out', 'success');
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        showToast('Error signing out', 'error');
    });
}

// Add logout event listeners
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', logout);
    }
    
    // User menu toggle
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Loading state management
function showLoading(message = 'Loading...') {
    // Create loading overlay
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <span class="text-gray-700">${message}</span>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    let bgColor, textColor, icon;
    
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            textColor = 'text-white';
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            textColor = 'text-white';
            icon = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            bgColor = 'bg-yellow-500';
            textColor = 'text-white';
            icon = 'fas fa-exclamation-triangle';
            break;
        default:
            bgColor = 'bg-blue-500';
            textColor = 'text-white';
            icon = 'fas fa-info-circle';
    }
    
    toast.className += ` ${bgColor} ${textColor}`;
    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="${icon}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Password strength indicator
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('signup-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = getPasswordStrength(password);
            updatePasswordStrengthIndicator(strength);
        });
    }
});

function getPasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
}

function updatePasswordStrengthIndicator(strength) {
    // This would update a password strength indicator if you add one to the UI
    console.log('Password strength:', strength);
} 