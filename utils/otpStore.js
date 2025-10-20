// utils/otpStore.js
// In-memory storage for OTP sessions
// In production, consider using Redis for better scalability

class OTPStore {
    constructor() {
        this.sessions = new Map();
        // Clean up expired sessions every 2 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 2 * 60 * 1000);
    }

    set(sessionId, data) {
        this.sessions.set(sessionId, {
            ...data,
            createdAt: new Date(),
        });
    }

    get(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        // Check if session is expired
        if (new Date() > session.expiresAt) {
            this.sessions.delete(sessionId);
            return null;
        }

        return session;
    }

    delete(sessionId) {
        return this.sessions.delete(sessionId);
    }

    // Clean up expired sessions
    cleanup() {
        const now = new Date();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now > session.expiresAt) {
                this.sessions.delete(sessionId);
            }
        }
    }

    // Get session count (for monitoring)
    size() {
        return this.sessions.size;
    }

    // Clear all sessions (for testing)
    clear() {
        this.sessions.clear();
    }
}

// Export singleton instance
module.exports = new OTPStore();
