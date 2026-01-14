
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { type } = req.query; // 'academy' or 'random'

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    try {
        if (type === 'academy') {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                icon: { type: Type.STRING },
                                text: { type: Type.STRING },
                                category: { type: Type.STRING }
                            },
                            required: ['title', 'icon', 'text', 'category']
                        }
                    }
                }
            });
            return res.status(200).json(JSON.parse(response.text || '[]'));

        } else if (type === 'random') {
            const topics = [
                "самый дорогой ингредиент в современном баре",
                "микробиология ферментации в коктейлях",
                "странные алкогольные законы в США и Европе",
                "любимые коктейли Эрнеста Хемингуэя или Черчилля",
                "происхождение названий барного инвентаря",
                "физика льда: почему прозрачный лед лучше",
                "как форма бокала меняет восприятие вкуса",
                "самые крепкие напитки в истории",
                "мифы о 'лечении' похмелья",
                "почему оливка в мартини меняет вкус",
                "секретные ингредиенты бутлегеров времен Сухого закона",
                "искусство сабража (открывание шампанского саблей)",
                "почему томатный сок вкуснее в самолете",
                "японская философия 'пути коктейля'"
            ];

            const randomTopic = topics[Math.floor(Math.random() * topics.length)];

            const prompt = `
        Мне нужен один УДИВИТЕЛЬНЫЙ, КОРОТКИЙ и НЕБАНАЛЬНЫЙ факт на тему: "${randomTopic}".
        
        Задача: Удивить гостя бара за 5 секунд.
        
        Требования:
        1. Длина: 1-2 предложения (очень кратко).
        2. Суть: Сразу к делу, без вводных слов "А знаете ли вы".
        3. Уникальность: Не пиши про то, что знают все. Давай что-то редкое.
        4. Язык: Живой Русский.
      `;

            const response = await ai.models.generateContent({
                model: 'gemini-flash-lite-latest',
                contents: prompt,
                config: {
                    temperature: 1.3,
                    maxOutputTokens: 60,
                }
            });
            return res.status(200).json({ fact: response.text });
        } else {
            return res.status(400).json({ error: "Invalid type param" });
        }

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
}
