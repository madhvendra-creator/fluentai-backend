import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import { config } from "./config/env.js";
import chatRoutes from "./api/routes/chat.routes.js";
import authRoutes from "./api/routes/auth.routes.js";

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors);
fastify.register(fastifyJwt, {
    secret: config.JWT_SECRET,
});
fastify.register(fastifyRateLimit, {
    max: 20,
    timeWindow: '1 minute'
});

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(chatRoutes);

// Run the server
const start = async () => {
    try {
        await fastify.listen({ port: config.PORT, host: "0.0.0.0" });
        fastify.log.info(`Server listening on ${config.PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
