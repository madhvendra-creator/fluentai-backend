import { chatController } from "../controllers/chat.controller.js";

export default async function chatRoutes(fastify, options) {
    fastify.post("/chat/reply", { preValidation: [fastify.authenticate] }, chatController.handleReply);

    fastify.post("/chat/evaluate", { preValidation: [fastify.authenticate] }, chatController.handleEvaluate);
}
