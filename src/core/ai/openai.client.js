import { OpenAI } from "openai";
import { config } from "../../config/env.js";

const openai = new OpenAI({
    apiKey: config.OPENAI_KEY
});

export const openaiClient = {
    async streamChatCompletion(history, message, topicId, targetLanguage) {
        let systemContent = "You are a friendly English conversation partner. Reply naturally in 1-3 short sentences. Ask a follow-up question. Do NOT correct their grammar here, just converse.";

        if (topicId === "translation_practice") {
            const sourceLang = targetLanguage ?
                message.match(/from (\w+) to/)?.[1] || "English" : "English";
            systemContent = `You are a translation practice bot. Generate EXACTLY ONE short everyday sentence in ${sourceLang || "English"} for the user to translate. Output ONLY the sentence itself. No explanation, no preamble. Example: 'How are you?' or 'मैं बाज़ार जा रहा हूँ'`;
        }
        else if (topicId && topicId !== "free_talk") {
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

    async evaluateSpeech(message, topicId, previousAiText, targetLanguage, sourceLang) {
        let systemContent = 'You are an English language tutor. Analyze the user\'s sentence. Respond ONLY with a JSON object in this exact format: { "correctedText": "string", "feedback": "short string", "score": integer 0-100 }.';

        if (topicId === "translation_practice" && previousAiText) {
            const lang = targetLanguage || 'Hindi';
            systemContent = `You are a strict translation evaluator. 
The user was asked to translate this ${sourceLang || 'English'} sentence into ${lang}: '${previousAiText}'. 
Evaluate their ${lang} translation in the user message.
Respond ONLY with JSON: 
{ 
  "correctedText": "ideal correct ${lang} translation of the original sentence",
  "feedback": "one short sentence on accuracy",
  "score": integer 0-100
}`;
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
