import { chatController } from "../controllers/chat.controller.js";

export default async function chatRoutes(fastify, options) {
    fastify.post("/chat/reply", chatController.handleReply);

    fastify.post("/chat/evaluate", chatController.handleEvaluate);
}
