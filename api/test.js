
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            status: "Error",
            message: "API Key is missing in Vercel Environment Variables."
        });
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: "Hello, backend test!",
        });

        return res.status(200).json({
            status: "Success",
            model: "gemini-1.5-flash",
            reply: response.text
        });
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            message: "API Key is present but call failed.",
            details: error.message
        });
    }
}
