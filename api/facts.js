const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { type } = req.query; // 'academy' or 'random'

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        if (type === 'academy') {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                title: { type: SchemaType.STRING },
                                icon: { type: SchemaType.STRING },
                                text: { type: SchemaType.STRING },
                                category: { type: SchemaType.STRING }
                            },
                            required: ['title', 'icon', 'text', 'category']
                        }
                    }
                }
            });

            const prompt = `
        Придумай 4 уникальных и профессиональных совета/факта для "Академии Вкуса". 
        Это должны быть продвинутые знания для любителей коктейлей.
        Категории: [ТЕХНИКА, ИСТОРИЯ, ТРЕНД, СЕКРЕТ ШЕФА].
        Язык: РУССКИЙ.
        Для каждого укажи: 
        - category (одну из списка выше)
        - title (яркий заголовок)
        - text (глубокий, но лаконичный совет до 140 символов)
        - icon (подходящий эмодзи)
      `;

            const result = await model.generateContent(prompt);
            return res.status(200).json(JSON.parse(result.response.text() || '[]'));

        } else if (type === 'random') {
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    temperature: 1.3,
                    maxOutputTokens: 60,
                }
            });

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

            const result = await model.generateContent(prompt);
            return res.status(200).json({ fact: result.response.text() });
        } else {
            return res.status(400).json({ error: "Invalid type param" });
        }

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Failed to generate content', details: error.message });
    }
};
