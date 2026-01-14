const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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

    const { history, message, userProfile, action } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    try {
        if (action === 'extract_memory') {
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
            const result = await model.generateContent(prompt);
            return res.status(200).json({ memory: result.response.text() || "" });
        } else {
            const systemInstruction = `Ты — ALEXEENKO AI, легендарный бармен. Твой стиль — живое, человечное общение. 
        
        ИНФОРМАЦИЯ О ГОСТЕ (твоя память):
        ${userProfile || "Гость зашел впервые, вы еще не знакомы."}
        
        ТВОЯ ЗАДАЧА:
        1. Веди себя как настоящий бармен: узнавай гостя, если он возвращается.
        2. Запоминай его вкусы (сладкое/кислое), его манеру речи (ты/вы), его принципы (например, не пьет крепкое) и личные детали.
        3. Если гость говорит "как обычно" или "ты же знаешь, что я люблю", используй данные из блока ПАМЯТИ выше.
        4. Будь харизматичным, но не навязчивым. Используй живой язык, эмодзи по делу и двойные переносы строк между логическими блоками.`;

            // Build chat history for the model
            const chatHistory = (history || []).map(h => ({
                role: h.role,
                parts: h.parts.map(p => ({ text: p.text }))
            }));

            const chat = model.startChat({
                history: chatHistory,
                systemInstruction: systemInstruction,
            });

            const result = await chat.sendMessage(message);
            const responseText = result.response.text();

            return res.status(200).json({
                text: responseText,
                history: [...(history || []), { role: 'user', parts: [{ text: message }] }, { role: 'model', parts: [{ text: responseText }] }]
            });
        }

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Chat failed', details: error.message });
    }
};
