import Redis from "ioredis";
import { config } from "../../config/env.js";

const redis = new Redis(config.REDIS_URL);
const MAX_HISTORY = 10;
const TTL_SECONDS = 86400; // 24 hours

export const redisService = {
    async getConversationHistory(sessionId) {
        try {
            const data = await redis.get(`session:${sessionId}`);
            return data ? JSON.parse(data) : [];
        } catch (err) {
            console.error("Redis Get Error:", err);
            return [];
        }
    },

    async saveConversationTurn(sessionId, userMessage, aiMessage) {
        try {
            const history = await this.getConversationHistory(sessionId);

            history.push({ role: "user", content: userMessage });
            history.push({ role: "assistant", content: aiMessage });

            // Sliding window to keep token counts reasonable
            const trimmedHistory = history.slice(-MAX_HISTORY);

            await redis.set(`session:${sessionId}`, JSON.stringify(trimmedHistory), 'EX', TTL_SECONDS);
        } catch (err) {
            console.error("Redis Save Error:", err);
        }
    }
};
