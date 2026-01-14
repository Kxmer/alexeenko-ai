
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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { base64Image } = req.body;

    if (!base64Image) {
        return res.status(400).json({ error: 'Image data is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Проанализируй это изображение. Найди на нем все продукты, напитки и алкоголь, которые можно использовать в качестве ингредиентов для коктейлей.
    Верни список ингредиентов в формате JSON массива строк на РУССКОМ языке.
    Пример: ["Водка", "Лайм", "Сахар", "Мята"].
    Если ничего не найдено, верни пустой массив [].
  `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg', // Assuming jpeg, could take from request if needed
                        data: base64Image,
                    },
                },
                { text: prompt },
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const text = response.text || '[]';
        const data = JSON.parse(text);
        return res.status(200).json(data);
    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Failed to analyze image', details: error.message });
    }
}
