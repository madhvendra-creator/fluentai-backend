import { OpenAI } from "openai";
import { config } from "../../config/env.js";

const openai = new OpenAI({
    apiKey: config.OPENAI_KEY
});

export const openaiClient = {
    async streamChatCompletion(history, message, topicId) {
        let systemContent = "You are a friendly English conversation partner. Reply naturally in 1-3 short sentences. Ask a follow-up question. Do NOT correct their grammar here, just converse.";
        
        if (topicId && topicId !== "free_talk") {
            systemContent = `You are a professional English tutor roleplaying as an interviewer for topic '${topicId}'. Keep your responses short (1-2 sentences). You must proactively ask a relevant follow-up question. Do NOT correct their grammar here, just converse.`;
        }

        const messages = [
            { role: "system", content: systemContent },
            ...history,
            { role: "user", content: message }
        ];

        return await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            stream: true
        });
    },

    async evaluateSpeech(message, topicId, previousAiText) {
        let systemContent = 'You are an English language tutor. Analyze the user\'s sentence. Respond ONLY with a JSON object in this exact format: { "correctedText": "string", "feedback": "short string", "score": integer 0-100 }.';

        if (topicId === "translation_practice" && previousAiText) {
            systemContent = `You are a strict translation evaluator. The user was asked to translate this sentence into Hindi: '${previousAiText}'. Evaluate their Hindi translation provided in the user message. Respond ONLY with a JSON object in this exact format: { "correctedText": "string", "feedback": "short string", "score": integer 0-100 }.`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: systemContent
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        // Parse the JSON string from OpenAI
        return JSON.parse(response.choices[0].message.content);
    }
};
