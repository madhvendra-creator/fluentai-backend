import { openaiClient } from "../../core/ai/openai.client.js";
import { redisService } from "../../services/session/redis.service.js";

export const chatController = {
    async handleReply(request, reply) {
        try {
            if (!request.body || !request.body.message || !request.body.sessionId) {
                return reply.status(400).send({ error: "Message and sessionId are required" });
            }

            const { sessionId, message, topicId } = request.body;

            // 1. Fetch History
            const history = await redisService.getConversationHistory(sessionId);

            // 2. Setup SSE Headers
            reply.hijack();
            reply.raw.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // 3. Stream Response
            const stream = await openaiClient.streamChatCompletion(history, message, topicId);
            let fullAiResponse = "";

            for await (const chunk of stream) {
                const textChunk = chunk.choices[0]?.delta?.content || "";
                if (textChunk) {
                    fullAiResponse += textChunk;
                    reply.raw.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
                }
            }

            // 5. Cleanup and Save
            await redisService.saveConversationTurn(sessionId, message, fullAiResponse);
            reply.raw.end();

        } catch (err) {
            request.log.error(err);
            if (!reply.raw.headersSent) {
                return reply.status(500).send({ error: err.message });
            }
            reply.raw.end();
        }
    },

    async handleEvaluate(request, reply) {
        try {
            if (!request.body || !request.body.message) {
                return reply.status(400).send({ error: "Message is required" });
            }

            const { message } = request.body;

            // Call OpenAI for JSON evaluation
            const evaluation = await openaiClient.evaluateSpeech(message);

            return reply.send(evaluation);

        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: err.message });
        }
    }
};
