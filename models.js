const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Message Schema
const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { User, Message };
