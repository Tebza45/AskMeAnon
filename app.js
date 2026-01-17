// ==================== APP STATE ====================

const appState = {
    currentUserId: null,
    currentUsername: null,
    currentQuestion: null,
    currentAnswerId: null,
    currentAnswerData: null,
    messagesCache: {} // Store messages for modal access
};

// ==================== UTILITY: ERROR & SUCCESS MESSAGES ====================

function showError(elementId, message, duration = 5000) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = `<div class="error-message">${message}</div>`;
    container.classList.remove('hidden');
    
    if (duration > 0) {
        setTimeout(() => {
            container.classList.add('hidden');
        }, duration);
    }
}

function showSuccess(elementId, message, duration = 3000) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = `<div class="success-banner">${message}</div>`;
    container.classList.remove('hidden');
    
    if (duration > 0) {
        setTimeout(() => {
            container.classList.add('hidden');
        }, duration);
    }
}

function showInfo(elementId, message, duration = 4000) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = `<div class="info-banner">${message}</div>`;
    container.classList.remove('hidden');
    
    if (duration > 0) {
        setTimeout(() => {
            container.classList.add('hidden');
        }, duration);
    }
}

// ==================== PAGE NAVIGATION ====================

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // Show target page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
        window.scrollTo(0, 0);
        // Focus first focusable element
        const firstFocusable = page.querySelector('button, input, textarea, [href], [tabindex]');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }
}

function goBack() {
    if (appState.currentUserId) {
        showPage('question-page');
    } else {
        showPage('landing-page');
    }
}

function goToDashboard() {
    if (appState.currentUserId) {
        loadUserDashboard();
        showPage('dashboard-page');
    }
}

// ==================== LANDING PAGE ====================

document.getElementById('landing-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();

    if (!isValidUsername(username)) {
        showError('landing-error', '❌ Please enter a valid name (2-50 characters)');
        return;
    }

    try {
        const userId = generateUserId();
        
        // Save user via API
        await api.createUser(userId, username);

        // Save to local storage
        setLocalStorage(StorageKeys.CURRENT_USER_ID, userId);
        setLocalStorage(StorageKeys.CURRENT_USERNAME, username);

        // Update app state
        appState.currentUserId = userId;
        appState.currentUsername = username;

        logSuccess('User created', { userId, username });

        // Navigate to questions page
        showQuestionPage();
    } catch (error) {
        logError('Failed to create user', error);
        showError('landing-error', '❌ Failed to create your link. Make sure the backend server is running (port 5000).');
    }
});

// ==================== QUESTION SELECTION ====================

function showQuestionPage() {
    // Display user link
    if (appState.currentUserId) {
        const userLink = getUserLink(appState.currentUserId);
        const userLinkInput = document.getElementById('user-link');
        if (userLinkInput) {
            userLinkInput.value = userLink;
        }
    }
    showPage('question-page');
}

function copyUserLink() {
    // Try to get link from share page first, then fall back to main link
    let linkInput = document.getElementById('share-user-link');
    if (!linkInput || linkInput.offsetParent === null) {
        // Share page not visible, use main link
        linkInput = document.getElementById('user-link');
    }
    
    const link = linkInput.value;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            logSuccess('Link copied to clipboard');
            // Show feedback
            const btn = document.querySelector('.btn-copy');
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            fallbackCopy(linkInput);
        });
    } else {
        fallbackCopy(linkInput);
    }
}

function fallbackCopy(element) {
    element.select();
    document.execCommand('copy');
    logSuccess('Link copied to clipboard');
    const btn = document.querySelector('.btn-copy');
    btn.textContent = '✅ Copied!';
    setTimeout(() => {
        btn.textContent = '📋 Copy';
    }, 2000);
}

function copyCardLink(button) {
    // Get the input field from the button's parent container
    const cardLinkSection = button.closest('.card-link-section');
    const linkInput = cardLinkSection.querySelector('.card-link-input');
    const link = linkInput.value;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            logSuccess('Link copied to clipboard');
            // Show feedback
            const originalText = button.textContent;
            button.textContent = '✅';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }).catch(() => {
            fallbackCopyCard(linkInput, button);
        });
    } else {
        fallbackCopyCard(linkInput, button);
    }
}

function fallbackCopyCard(element, button) {
    element.select();
    document.execCommand('copy');
    logSuccess('Link copied to clipboard');
    const originalText = button.textContent;
    button.textContent = '✅';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

function selectQuestion(question) {
    appState.currentQuestion = question;
    setLocalStorage(StorageKeys.CURRENT_QUESTION, question);

    // Show share page
    document.getElementById('share-question-text').textContent = question;
    
    // Populate the share link
    if (appState.currentUserId) {
        const userLink = getUserLink(appState.currentUserId);
        document.getElementById('share-user-link').value = userLink;
    }
    
    showPage('share-page');
}

// ==================== WHATSAPP SHARING ====================

function shareToWhatsApp() {
    if (!appState.currentUserId || !appState.currentQuestion) {
        alert('Missing user data');
        return;
    }

    const userLink = getUserLink(appState.currentUserId);
    const message = `${appState.currentQuestion}\n\nAnswer me anonymously 👇\n${userLink}`;

    const whatsappLink = getWhatsAppShareLink(message);
    window.open(whatsappLink, '_blank');

    logInfo('Shared to WhatsApp', { question: appState.currentQuestion });
}

// ==================== STATUS IMAGE GENERATOR ====================

function generateStatusImage() {
    const canvas = document.getElementById('status-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size (9:16 aspect ratio - Instagram story size)
    canvas.width = 1080;
    canvas.height = 1920;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, '#7c3aed');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * 1080, Math.random() * 1920, Math.random() * 200 + 100, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💬 Anonymous', 540, 250);

    // Draw question
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#e0e0e0';
    
    const questionText = appState.currentQuestion;
    const maxCharsPerLine = 16;
    const questionLines = wrapText(questionText, maxCharsPerLine);
    
    let yPosition = 450;
    const lineHeight = 80;
    questionLines.forEach(line => {
        ctx.fillText(line, 540, yPosition);
        yPosition += lineHeight;
    });

    // Draw username
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`@${appState.currentUsername}`, 540, yPosition + 100);

    // Draw CTA
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Answer me 👇', 540, 1700);

    // Draw decorative line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 1800);
    ctx.lineTo(930, 1800);
    ctx.stroke();

    // Draw QR code placeholder or link
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('askmeanon.site/u/' + appState.currentUserId.substring(0, 8), 540, 1880);

    // Show canvas container
    document.getElementById('canvas-container').classList.remove('hidden');

    logInfo('Status image generated');
}

function wrapText(text, maxCharsPerLine) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length > maxCharsPerLine) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine += (currentLine ? ' ' : '') + word;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
}

function downloadStatusImage() {
    const canvas = document.getElementById('status-canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `AskMeAnon_${appState.currentUsername}_${Date.now()}.png`;
    link.click();

    logSuccess('Image downloaded');
}

function closeCanvas() {
    document.getElementById('canvas-container').classList.add('hidden');
}

// ==================== ANONYMOUS ANSWER PAGE ====================

// Check if accessing via answer link
window.addEventListener('load', () => {
    const answerId = getUrlParameter('answer');
    if (answerId) {
        loadAnswerPage(answerId);
    } else {
        const savedUserId = getLocalStorage(StorageKeys.CURRENT_USER_ID);
        const savedUsername = getLocalStorage(StorageKeys.CURRENT_USERNAME);
        
        if (savedUserId && savedUsername) {
            appState.currentUserId = savedUserId;
            appState.currentUsername = savedUsername;
            showQuestionPage();
        } else {
            showPage('landing-page');
        }
    }
});

async function loadAnswerPage(userId) {
    try {
        // Fetch user data via API
        const user = await api.getUser(userId);
        const username = user.name;

        // Update UI
        document.getElementById('answer-username').textContent = `Ask ${username}`;

        // Get a random question to display (or use URL param if provided)
        const questionParam = getUrlParameter('question');
        const questions = [
            "What do you honestly think about me?",
            "Would you date me? 👀",
            "What is my biggest weakness?",
            "What should I improve about myself?",
            "What secret would you tell me anonymously?",
            "What's your first impression of me?"
        ];

        const selectedQuestion = questionParam || questions[Math.floor(Math.random() * questions.length)];
        document.getElementById('answer-question').textContent = selectedQuestion;

        // Store current answer context
        appState.currentAnswerId = userId;
        appState.currentQuestion = selectedQuestion;
        setLocalStorage(StorageKeys.CURRENT_ANSWER_ID, userId);

        // Setup answer form
        setupAnswerForm(userId, selectedQuestion);

        showPage('answer-page');
        
        logInfo('Answer page loaded', { userId, username, question: selectedQuestion });
    } catch (error) {
        logError('Failed to load answer page', error);
        showError('answer-error', '❌ Failed to load. User not found or server error.');
        showPage('landing-page');
    }
}

function setupAnswerForm(userId, question) {
    const form = document.getElementById('answer-form');
    const answerInput = document.getElementById('answer-input');
    const charCount = document.getElementById('char-count');

    // Reset form
    form.reset();
    document.getElementById('success-message').classList.add('hidden');

    // Character counter
    answerInput.addEventListener('input', (e) => {
        const count = e.target.value.length;
        charCount.textContent = `${count}/500`;
    });

    // Form submission
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const answer = answerInput.value.trim();

        if (!isValidAnswer(answer)) {
            showError('answer-error', '❌ Please enter a valid answer (1-500 characters)');
            return;
        }

        try {
            const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            // Save answer via API
            await api.saveMessage(messageId, userId, question, answer);

            logSuccess('Answer submitted', { userId, question });

            // Show success message
            form.style.display = 'none';
            document.getElementById('success-message').classList.remove('hidden');

            setTimeout(() => {
                showPage('landing-page');
            }, 2000);
        } catch (error) {
            logError('Failed to submit answer', error);
            showError('answer-error', '❌ Failed to send your answer. Please check your connection and try again.');
        }
    };
}

// ==================== USER DASHBOARD ====================

async function loadUserDashboard() {
    if (!appState.currentUserId) {
        showPage('landing-page');
        return;
    }

    try {
        const messagesList = document.getElementById('messages-list');
        const noMessages = document.getElementById('no-messages');
        
        messagesList.innerHTML = '';

        // Fetch all messages for this user via API
        const messages = await api.getMessages(appState.currentUserId);

        if (!messages || messages.length === 0) {
            messagesList.classList.add('hidden');
            noMessages.classList.remove('hidden');
            return;
        }

        messagesList.classList.remove('hidden');
        noMessages.classList.add('hidden');

        // Display messages
        messages.forEach(message => {
            const messageCard = createMessageCard(message.messageId, message);
            messagesList.appendChild(messageCard);
        });

        logSuccess('Dashboard loaded', { messageCount: messages.length });
    } catch (error) {
        logError('Failed to load dashboard', error);
        showError('messages-error', '❌ Failed to load your answers. Make sure the backend server is running.');
    }
}

function createMessageCard(messageId, message) {
    const card = document.createElement('div');
    card.className = 'message-card';
    
    const date = formatDate(message.createdAt);
    
    // Store message in cache for modal access
    appState.messagesCache[messageId] = message;
    
    card.innerHTML = `
        <div class="message-preview">
            <p class="message-label">Question:</p>
            <p class="message-text">${sanitizeInput(message.question)}</p>
            <p class="message-label" style="margin-top: 10px;">Answer:</p>
            <p class="message-text">${sanitizeInput(message.answer)}</p>
            <p class="message-date">${date}</p>
        </div>
        <div class="message-actions">
            <button class="btn btn-success" onclick="openAnswerModal('${messageId}')">
                🎨 Share to Status
            </button>
            <button class="btn btn-danger" onclick="deleteAnswerConfirm('${messageId}')">
                🗑️ Delete
            </button>
        </div>
    `;

    return card;
}

function openAnswerModal(messageId) {
    try {
        const message = appState.messagesCache[messageId];
        
        if (!message) {
            alert('Message not found');
            return;
        }

        appState.currentAnswerId = messageId;
        appState.currentAnswerData = message;

        document.getElementById('modal-question').textContent = message.question;
        document.getElementById('modal-answer').textContent = message.answer;

        document.getElementById('answer-modal').classList.remove('hidden');
    } catch (error) {
        logError('Failed to open modal', error);
        showError('messages-error', '❌ Failed to open message. Please try again.');
    }
}

function closeAnswerModal() {
    document.getElementById('answer-modal').classList.add('hidden');
}

function shareAnswerToStatus() {
    if (!appState.currentAnswerData) {
        showError('modal-error', '❌ No answer data found. Please try again.');
        return;
    }

    const canvas = document.getElementById('status-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1920;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, '#7c3aed');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Draw decorative circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(200, 300, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 1600, 200, 0, Math.PI * 2);
    ctx.fill();

    // Draw title
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💬 Got an Answer!', 540, 150);

    // Draw question section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('❓ Question:', 540, 280);

    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#e0e0e0';
    
    const questionText = appState.currentAnswerData.question;
    const questionLines = wrapText(questionText, 18);
    
    let yPosition = 350;
    const lineHeight = 60;
    questionLines.forEach(line => {
        ctx.fillText(line, 540, yPosition);
        yPosition += lineHeight;
    });

    // Draw separator
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, yPosition + 20);
    ctx.lineTo(980, yPosition + 20);
    ctx.stroke();

    // Draw answer section
    yPosition += 50;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('💭 Answer:', 540, yPosition);

    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#90ee90';
    
    yPosition += 80;
    const answerText = appState.currentAnswerData.answer;
    const answerLines = wrapText(answerText, 18);
    
    answerLines.forEach(line => {
        ctx.fillText(line, 540, yPosition);
        yPosition += lineHeight;
    });

    // Draw CTA
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('Answer Me Too? 👇', 540, 1700);

    // Draw link
    ctx.font = 'bold 38px Arial';
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText('askmeanon.site/u/' + appState.currentUserId.substring(0, 10), 540, 1820);

    // Auto-download the image
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `AskMeAnon_Answer_${appState.currentUsername}_${Date.now()}.png`;
        link.click();
        logSuccess('Image downloaded automatically');
    }, 500);

    logInfo('Answer status image generated with question and answer');
}

function deleteAnswerConfirm(messageId) {
    if (confirm('Are you sure you want to delete this answer?')) {
        deleteAnswer(messageId);
    }
}

async function deleteAnswer(messageId) {
    try {
        await api.deleteMessage(messageId, appState.currentUserId);
        logSuccess('Answer deleted', { messageId });
        loadUserDashboard();
        closeAnswerModal();
    } catch (error) {
        logError('Failed to delete answer', error);
        showError('messages-error', '❌ Failed to delete answer. Please try again.');
    }
}

// Modal close button
document.querySelector('.modal-close')?.addEventListener('click', closeAnswerModal);

// Close modal on background click
document.getElementById('answer-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'answer-modal') {
        closeAnswerModal();
    }
});

logInfo('App initialized');
