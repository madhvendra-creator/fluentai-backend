import dotenv from "dotenv";

dotenv.config();

export const config = {
    OPENAI_KEY: process.env.OPENAI_KEY,
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || "super-secret-default-key-for-local-dev-only",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379"
};

if (!config.OPENAI_KEY) {
    console.warn("WARNING: OPENAI_KEY environment variable is missing.");
}
if (!process.env.JWT_SECRET) {
    console.warn("WARNING: JWT_SECRET environment variable is missing. Using default unsafe key.");
}
