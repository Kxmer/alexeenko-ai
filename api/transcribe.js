
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

    const { base64Audio, mimeType = 'audio/webm' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = "Прослушай это аудиосообщение и напиши дословно, что сказал пользователь. Верни только текст транскрипции на языке говорящего (скорее всего Русский). Если аудио пустое или неразборчивое, верни пустую строку.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Audio,
                    },
                },
                { text: prompt },
            ],
        });
        return res.status(200).json({ text: response.text?.trim() || "" });
    } catch (error) {
        console.error("Transcription failed", error);
        return res.status(500).json({ error: 'Transcription failed' });
    }
}
