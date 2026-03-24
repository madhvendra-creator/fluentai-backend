import { OpenAI } from "openai";
import { config } from "../../config/env.js";

const openai = new OpenAI({
    apiKey: config.OPENAI_KEY
});

export const openaiClient = {
    async streamChatCompletion(history, message, topicId) {
        let systemContent = "You are a friendly English conversation partner. The user is practicing English. Reply naturally in 1-3 short sentences to keep the conversation going. Ask a follow-up question. Do NOT correct their grammar here, just converse.";
        
        if (topicId) {
            systemContent = `You are a professional English tutor roleplaying as an interviewer. The current topic is '${topicId}'. Keep your responses short (1-2 sentences). Do not just agree with the user. You must proactively ask a relevant follow-up question to keep them speaking English.`;
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

    async evaluateSpeech(message) {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: 'You are an English language tutor. Analyze the user\'s sentence. Respond ONLY with a JSON object in this exact format: { "correctedText": "string", "feedback": "short string", "score": integer 0-100 }.'
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
