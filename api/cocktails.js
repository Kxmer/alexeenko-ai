
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

  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Ingredients array is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Ты — легендарный шеф-бармен мирового уровня, эксперт по миксологии и балансу вкусов. 
    Твоя задача — создать меню из 10 КЛАССИЧЕСКИХ и 10 АВТОРСКИХ коктейлей, используя (но не ограничиваясь только ими) следующие ингредиенты: ${ingredients.join(", ")}.

    ТРЕБОВАНИЯ К КАЧЕСТВУ:
    1. Классика: Строгое соответствие мировым стандартам (IBA). Никаких "примерных" пропорций.
    2. Авторские: Это должны быть ВКУСНЫЕ и СЪЕДОБНЫЕ напитки. Соблюдай баланс: крепкая часть, сладкая часть, кислая часть (правило золотого сечения коктейля).
    3. Ингредиенты: Используй точные меры в мл или дэшах.
    4. Техника: Указывай конкретный метод (Shake, Stir, Build, Muddle, Throwing).
    5. Презентация: Опиши бокал и профессиональный гарнир.
    6. Описание: Напиши краткое, но "вкусное" описание, как в меню дорогого миксологического бара.
    7. Обоснование (mixologistReasoning): Для каждого коктейля (особенно авторского) напиши экспертное обоснование баланса. Почему эти ингредиенты работают вместе? Как они влияют на вкусовые рецепторы? Укажи на взаимодействие кислотности, сладости и крепости. Это должно быть убедительно для профессионального бармена.
    8. Цвет: HEX-код должен максимально точно передавать реальный цвет готового напитка.

    Язык ответа: РУССКИЙ.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Switched to stable 1.5 Flash
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  glassType: { type: Type.STRING },
                  method: { type: Type.STRING },
                  flavorProfile: { type: Type.STRING },
                  colorHex: { type: Type.STRING },
                  mixologistReasoning: { type: Type.STRING }
                },
                required: ['name', 'description', 'ingredients', 'instructions', 'glassType', 'method', 'flavorProfile', 'colorHex', 'mixologistReasoning']
              }
            },
            aiCreations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  glassType: { type: Type.STRING },
                  method: { type: Type.STRING },
                  flavorProfile: { type: Type.STRING },
                  colorHex: { type: Type.STRING },
                  mixologistReasoning: { type: Type.STRING }
                },
                required: ['name', 'description', 'ingredients', 'instructions', 'glassType', 'method', 'flavorProfile', 'colorHex', 'mixologistReasoning']
              }
            }
          },
          required: ['classics', 'aiCreations']
        }
      }
    });

    const text = response.text || '{}';
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: 'Failed to generate cocktails', details: error.message });
  }
}
