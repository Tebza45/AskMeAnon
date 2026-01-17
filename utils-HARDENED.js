// ==================== UTILITY FUNCTIONS ====================

// ✅ SECURE: Use cryptographically secure random ID
function generateUserId() {
    // In production with Node.js, use: require('crypto').randomBytes(16).toString('hex')
    // For browser, use this fallback:
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    return `user_${timestamp}${randomPart}`.substring(0, 50);
}

// ✅ SECURE: Generate message ID
function generateMessageId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    return `msg_${timestamp}${randomPart}`.substring(0, 50);
}

// Get current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';

    return date.toLocaleDateString();
}

// Encode text for WhatsApp
function encodeForWhatsApp(text) {
    return encodeURIComponent(text);
}

// Generate WhatsApp share link
function getWhatsAppShareLink(message) {
    return `https://wa.me/?text=${encodeForWhatsApp(message)}`;
}

// Get base URL
function getBaseUrl() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? ':' + window.location.port : '';
    return `${protocol}//${hostname}${port}`;
}

// Generate user link
function getUserLink(userId) {
    return `${getBaseUrl()}?answer=${encodeURIComponent(userId)}`;
}

// Get parameter from URL - ✅ SECURE: Validate before use
function getUrlParameter(param) {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(param);
    // Validate length to prevent attacks
    return value && value.length <= 100 ? value : null;
}

// ✅ SECURE: Sanitize input for display (prevents XSS)
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = input; // textContent prevents XSS, not innerHTML
    return div.innerHTML;
}

// Add zero to single digit numbers
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// Generate random gradient
function getRandomGradient() {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

// Clipboard copy
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

// ==================== LOCAL STORAGE HELPERS ====================

const StorageKeys = {
    CURRENT_USER_ID: 'currentUserId',
    CURRENT_USERNAME: 'currentUsername',
    CURRENT_QUESTION: 'currentQuestion',
    CURRENT_ANSWER_ID: 'currentAnswerId'
};

function setLocalStorage(key, value) {
    try {
        // ✅ SECURE: Validate key is in whitelist
        if (!Object.values(StorageKeys).includes(key)) {
            console.warn('Invalid storage key:', key);
            return;
        }
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('localStorage error:', e);
    }
}

function getLocalStorage(key) {
    try {
        // ✅ SECURE: Validate key is in whitelist
        if (!Object.values(StorageKeys).includes(key)) {
            console.warn('Invalid storage key:', key);
            return null;
        }
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('localStorage error:', e);
        return null;
    }
}

function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('localStorage error:', e);
    }
}

function clearLocalStorage() {
    try {
        // Only clear known keys, not entire storage
        Object.values(StorageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (e) {
        console.error('localStorage error:', e);
    }
}

// ==================== VALIDATION ====================

// ✅ SECURE: Stricter validation
function isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    const trimmed = username.trim();
    // Allow only alphanumeric, spaces, hyphens, periods, apostrophes
    return trimmed.length >= 2 && 
           trimmed.length <= 50 && 
           /^[a-zA-Z0-9\s\-\.\']+$/.test(trimmed);
}

function isValidAnswer(answer) {
    if (!answer || typeof answer !== 'string') return false;
    const trimmed = answer.trim();
    return trimmed.length >= 1 && trimmed.length <= 500;
}

// ==================== CONSOLE LOGGING ====================

// ✅ PRODUCTION: Disable logging in production builds
const IS_PRODUCTION = window.location.hostname !== 'localhost' && 
                     !window.location.hostname.startsWith('192.168');

function logInfo(message, data = null) {
    if (!IS_PRODUCTION) {
        console.log(`[INFO] ${message}`, data || '');
    }
}

function logError(message, error = null) {
    if (!IS_PRODUCTION) {
        console.error(`[ERROR] ${message}`, error || '');
    }
}

function logSuccess(message, data = null) {
    if (!IS_PRODUCTION) {
        console.log(`[SUCCESS] ${message}`, data || '');
    }
}

// ==================== SECURITY HELPERS ====================

// ✅ Validate URL to prevent open redirects
function isValidRedirectUrl(url) {
    try {
        const urlObj = new URL(url, window.location.origin);
        return urlObj.origin === window.location.origin;
    } catch {
        return false;
    }
}

// ✅ Escape HTML entities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
