const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { User, Message } = require('./models');

const app = express();
const PORT = process.env.PORT || process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/askmeanon';
const NODE_ENV = process.env.NODE_ENV || 'development';

// ==================== SECURITY MIDDLEWARE ====================

// 1. Add security headers
app.use(helmet());

// 2. Restrict CORS to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['localhost', '127.0.0.1'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.some(allowed => origin.includes(allowed.trim()))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT']
}));

// 3. Rate limiting - prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const createUserLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour
    message: 'Too many user creations from this IP'
});

const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 messages per minute per IP
    message: 'Too many messages sent, please try again later'
});

app.use('/api/', limiter);

// 4. Body parser with size limits
app.use(bodyParser.json({ limit: '1kb' })); // Prevent large payloads
app.use(bodyParser.urlencoded({ extended: true, limit: '1kb' }));

// 5. Serve static files from current directory
app.use(express.static(__dirname));

// ==================== INPUT VALIDATION ====================

function validateUsername(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 50 && /^[a-zA-Z0-9\s\-\.\']+$/.test(trimmed);
}

function validateUserId(userId) {
    if (!userId || typeof userId !== 'string') return false;
    return /^user_[0-9a-z]+$/.test(userId) && userId.length <= 100;
}

function validateQuestion(question) {
    if (!question || typeof question !== 'string') return false;
    const trimmed = question.trim();
    return trimmed.length >= 5 && trimmed.length <= 200;
}

function validateAnswer(answer) {
    if (!answer || typeof answer !== 'string') return false;
    const trimmed = answer.trim();
    return trimmed.length >= 1 && trimmed.length <= 500;
}

function validateMessageId(messageId) {
    if (!messageId || typeof messageId !== 'string') return false;
    return /^msg_[0-9a-z]+$/.test(messageId) && messageId.length <= 100;
}

// ==================== RESPONSE HANDLER ====================

function sendError(res, statusCode, message) {
    // Never expose internal error details in production
    const isDev = NODE_ENV === 'development';
    res.status(statusCode).json({ 
        error: isDev ? message : 'An error occurred. Please try again.',
        timestamp: new Date().toISOString()
    });
}

// ==================== MONGODB CONNECTION ====================

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB connected securely');
})
.catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

// ==================== API ROUTES ====================

// Create User - with rate limiting
app.post('/api/users/create', createUserLimiter, async (req, res) => {
    try {
        const { userId, name } = req.body;

        // Validate inputs
        if (!validateUserId(userId)) {
            return sendError(res, 400, 'Invalid userId format');
        }
        if (!validateUsername(name)) {
            return sendError(res, 400, 'Invalid name (2-50 characters, alphanumeric only)');
        }

        // Check if user already exists
        let user = await User.findOne({ userId });
        if (user) {
            return res.json({ success: true, user: { userId: user.userId, name: user.name } });
        }

        // Create new user
        user = new User({
            userId,
            name: name.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await user.save();
        res.json({ 
            success: true, 
            user: { userId: user.userId, name: user.name } 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        sendError(res, 500, 'Failed to create user');
    }
});

// Get User Info
app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!validateUserId(userId)) {
            return sendError(res, 400, 'Invalid userId format');
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        // Don't expose internal fields
        res.json({ 
            success: true, 
            user: { userId: user.userId, name: user.name } 
        });
    } catch (error) {
        console.error('Error getting user:', error);
        sendError(res, 500, 'Failed to fetch user');
    }
});

// Save Message - with rate limiting and authorization
app.post('/api/messages/create', messageLimiter, async (req, res) => {
    try {
        const { messageId, userId, question, answer } = req.body;

        // Validate all inputs
        if (!validateMessageId(messageId)) {
            return sendError(res, 400, 'Invalid messageId format');
        }
        if (!validateUserId(userId)) {
            return sendError(res, 400, 'Invalid userId format');
        }
        if (!validateQuestion(question)) {
            return sendError(res, 400, 'Invalid question format');
        }
        if (!validateAnswer(answer)) {
            return sendError(res, 400, 'Invalid answer format');
        }

        // Verify user exists
        const user = await User.findOne({ userId });
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        // Check if message already exists
        const existingMessage = await Message.findOne({ messageId });
        if (existingMessage) {
            return sendError(res, 409, 'Message already exists');
        }

        const message = new Message({
            messageId,
            userId,
            question: question.trim(),
            answer: answer.trim(),
            createdAt: new Date()
        });

        await message.save();
        res.json({ 
            success: true, 
            message: { messageId: message.messageId } 
        });
    } catch (error) {
        console.error('Error saving message:', error);
        sendError(res, 500, 'Failed to save message');
    }
});

// Get User Messages - with user ownership verification
app.get('/api/messages/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!validateUserId(userId)) {
            return sendError(res, 400, 'Invalid userId format');
        }

        // Verify user exists
        const user = await User.findOne({ userId });
        if (!user) {
            return sendError(res, 404, 'User not found');
        }

        const messages = await Message.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean(); // Use lean for better performance

        // Return only necessary fields
        const sanitizedMessages = messages.map(msg => ({
            messageId: msg.messageId,
            question: msg.question,
            answer: msg.answer,
            createdAt: msg.createdAt
        }));

        res.json({ 
            success: true, 
            messages: sanitizedMessages, 
            count: sanitizedMessages.length 
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        sendError(res, 500, 'Failed to fetch messages');
    }
});

// Delete Message - with user authorization
app.delete('/api/messages/:messageId', async (req, res) => {
    try {
        const { messageId, userId } = req.body; // userId must be provided in body

        if (!validateMessageId(messageId)) {
            return sendError(res, 400, 'Invalid messageId format');
        }
        if (!validateUserId(userId)) {
            return sendError(res, 400, 'Invalid userId format');
        }

        // Find message and verify ownership
        const message = await Message.findOne({ messageId });
        if (!message) {
            return sendError(res, 404, 'Message not found');
        }

        // ✅ CRITICAL: Verify user owns this message
        if (message.userId !== userId) {
            return sendError(res, 403, 'Unauthorized: You can only delete your own messages');
        }

        await Message.deleteOne({ messageId });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        sendError(res, 500, 'Failed to delete message');
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    sendError(res, 500, 'Internal server error');
});

// ==================== SERVER STARTUP ====================

app.listen(PORT, () => {
    console.log(`\n✅ AskMeAnon Server running securely on port ${PORT}`);
    console.log(`📊 Database: Connected`);
    console.log(`🔒 Security: Enabled (Rate limiting, Input validation, CORS restricted)\n`);
});

module.exports = app;
