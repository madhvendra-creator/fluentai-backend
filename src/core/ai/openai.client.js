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

        // NEW: Inject strict autocorrect logic
        if (isAutocorrectEnabled && message.trim().toLowerCase() !== correctedText.trim().toLowerCase()) {
            systemContent += `\nIMPORTANT: The user just made a grammar mistake. They said "${message}", but the correct way is "${correctedText}". You MUST start your reply by saying exactly: "That is incorrect, you can say instead: ${correctedText}". After saying that, continue the conversation normally and ask your follow-up question.`;
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
