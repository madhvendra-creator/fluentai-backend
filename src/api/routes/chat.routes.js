import { chatController } from "../controllers/chat.controller.js";

export default async function chatRoutes(fastify, options) {
    fastify.post("/chat/reply", {
        preValidation: async (request, reply) => {
            try {
                await request.jwtVerify()
            } catch (err) {
                return reply.send(err)
            }
        }
    }, chatController.handleReply);

    fastify.post("/chat/evaluate", {
        preValidation: async (request, reply) => {
            try {
                await request.jwtVerify()
            } catch (err) {
                return reply.send(err)
            }
        }
    }, chatController.handleEvaluate);
}
