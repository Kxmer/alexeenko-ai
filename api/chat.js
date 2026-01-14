
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { history, message, userProfile, action } = req.body; // action: 'chat' or 'extract_memory'
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    try {
        if (action === 'extract_memory') {
            // Формируем текст истории для анализа
            const historyText = history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n');

            const prompt = `
            Проанализируй диалог бармена и гостя. Составь краткий профиль гостя (память бармена).
            Укажи:
            - Имя (если есть)
            - Вкусовые предпочтения (что любит, что нет)
            - Стиль общения (как к нему обращаться, формальный/дружеский)
            - Особенности характера или привычки (если проявились)
            
            Пиши лаконично, списком. На русском. Если информации мало, напиши то, что есть.
            
            ДИАЛОГ:
            ${historyText}
        `;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            return res.status(200).json({ memory: response.text || "" });
        } else {
            // Chat action
            const systemInstruction = `Ты — ALEXEENKO AI, легендарный бармен. Твой стиль — живое, человечное общение. 
        
        ИНФОРМАЦИЯ О ГОСТЕ (твоя память):
        ${userProfile || "Гость зашел впервые, вы еще не знакомы."}
        
        ТВОЯ ЗАДАЧА:
        1. Веди себя как настоящий бармен: узнавай гостя, если он возвращается.
        2. Запоминай его вкусы (сладкое/кислое), его манеру речи (ты/вы), его принципы (например, не пьет крепкое) и личные детали.
        3. Если гость говорит "как обычно" или "ты же знаешь, что я люблю", используй данные из блока ПАМЯТИ выше.
        4. Будь харизматичным, но не навязчивым. Используй живой язык, эмодзи по делу и двойные переносы строк между логическими блоками.`;

            // Since we are stateless, we re-hydrate the chat with history + new message
            // Actually, for single turn with history context:
            const chat = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: { systemInstruction },
                history: history || []
            });

            const result = await chat.sendMessage(message);
            return res.status(200).json({
                text: result.response.text(),
                history: [...(history || []), { role: 'user', parts: [{ text: message }] }, { role: 'model', parts: [{ text: result.response.text() }] }]
            });
        }

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Chat failed', details: error.message });
    }
}
