// API Configuration for AskMeAnon
// Connects to MongoDB backend via Express API
// Dynamically detects the API URL to work on any device

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port ? window.location.port : (window.location.protocol === 'https:' ? 443 : 80)}/api`;

// API Helper Functions
const api = {
    async createUser(userId, name) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, name })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create user');
            return data.user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    async getUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'User not found');
            return data.user;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    async saveMessage(messageId, userId, question, answer) {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, userId, question, answer })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save message');
            return data.message;
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    },

    async getMessages(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${userId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');
            return data.messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    async deleteMessage(messageId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, userId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete message');
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    },

    async healthCheck() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
};

console.log('✅ API Config loaded - Using MongoDB Backend');
