const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  // Enable CORS
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

  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Ingredients array is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          classics: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                glassType: { type: SchemaType.STRING },
                method: { type: SchemaType.STRING },
                flavorProfile: { type: SchemaType.STRING },
                colorHex: { type: SchemaType.STRING },
                mixologistReasoning: { type: SchemaType.STRING }
              },
              required: ['name', 'description', 'ingredients', 'instructions', 'glassType', 'method', 'flavorProfile', 'colorHex', 'mixologistReasoning']
            }
          },
          aiCreations: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                ingredients: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                instructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                glassType: { type: SchemaType.STRING },
                method: { type: SchemaType.STRING },
                flavorProfile: { type: SchemaType.STRING },
                colorHex: { type: SchemaType.STRING },
                mixologistReasoning: { type: SchemaType.STRING }
              },
              required: ['name', 'description', 'ingredients', 'instructions', 'glassType', 'method', 'flavorProfile', 'colorHex', 'mixologistReasoning']
            }
          }
        },
        required: ['classics', 'aiCreations']
      }
    }
  });

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
    7. Обоснование (mixologistReasoning): Для каждого коктейля (особенно авторского) напиши экспертное обоснование баланса.
    8. Цвет: HEX-код должен максимально точно передавать реальный цвет готового напитка.

    Язык ответа: РУССКИЙ.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text() || '{}';
    const data = JSON.parse(text);
    return res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: 'Failed to generate cocktails', details: error.message });
  }
};
