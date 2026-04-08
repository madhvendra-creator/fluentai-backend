import { OpenAI } from "openai";
import { config } from "../../config/env.js";

const openai = new OpenAI({
    apiKey: config.OPENAI_KEY
});

export const openaiClient = {
    async streamChatCompletion(history, message, topicId, correctedText, isAutocorrectEnabled) {
        let systemContent = "You are a friendly English conversation partner. Reply naturally in 1-3 short sentences. Ask a follow-up question.";
        
        if (topicId && topicId !== "free_talk") {
            systemContent = `You are a professional English tutor roleplaying as an interviewer for topic '${topicId}'. Keep your responses short (1-2 sentences). You must proactively ask a relevant follow-up question.`;
        }

        // FIX 1: Clean strings to prevent false positives from punctuation and capitalization
        const cleanMsg = message.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase();
        const cleanCorr = correctedText.replace(/[^a-zA-Z0-9\s]/g, '').trim().toLowerCase();
        const hasMistake = cleanMsg !== cleanCorr;

        // FIX 2: Strict multi-line template for formatting
        if (isAutocorrectEnabled && hasMistake) {
            systemContent += `\n\nIMPORTANT: The user made a grammar mistake. You MUST structure your response in two distinct parts separated by a blank line.

Line 1 EXACTLY: "That is incorrect, you can say instead: ${correctedText}"
Line 2: (Leave this blank)
Line 3: (Your natural conversational reply to the user's message)

Do NOT merge them together.`;
        } else {
            systemContent += "\nDo NOT correct their grammar here, just converse.";
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
