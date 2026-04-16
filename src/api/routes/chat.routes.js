import { chatController } from "../controllers/chat.controller.js";

export default async function chatRoutes(fastify, options) {
    const authenticate = async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    };

    fastify.post(
        "/chat/reply",
        { preValidation: [authenticate] },
        chatController.handleReply
    );

    fastify.post(
        "/chat/evaluate",
        { preValidation: [authenticate] },
        chatController.handleEvaluate
    );

    fastify.post(
        "/chat/hint",
        { preValidation: [authenticate] },
        chatController.handleHint
    );
}
