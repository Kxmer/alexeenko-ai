
import { MixologyResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const generateCocktails = async (ingredients: string[]): Promise<MixologyResponse> => {
  return withRetry(async () => {
    const response = await fetch(`${API_BASE_URL}/cocktails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure types used in UI are set.
    // The server returns the same structure, but let's be safe.
    if (data.classics) data.classics.forEach((c: any) => c.type = 'classic');
    if (data.aiCreations) data.aiCreations.forEach((c: any) => c.type = 'ai');

    return data as MixologyResponse;
  });
};

export const analyzeIngredientsFromImage = async (base64Image: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/image-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Image analysis failed", error);
    return [];
  }
};

export const generateAcademyItems = async (): Promise<{ title: string, icon: string, text: string, category: string }[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/facts?type=academy`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error("Failed to fetch academy items");
    return await response.json();
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const generateRandomFact = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/facts?type=random`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error("Failed to fetch fact");
    const data = await response.json();
    return data.fact || "Шампанское в бокале создает пузырьки только на микроскопических частицах пыли.";
  } catch (e) {
    console.error("Fact generation error:", e);
    // Резервные факты на случай ошибки API
    const backups = [
      "В одной бутылке шампанского содержится около 49 миллионов пузырьков.",
      "Текила технически никогда не содержит червяка — это рекламный трюк производителей мескаля.",
      "Кофеин в Espresso Martini не нейтрализует алкоголь, а лишь маскирует чувство опьянения.",
      "Самый старый рецепт пива в мире насчитывает более 5000 лет.",
      "Форма бокала 'Купе' не была слеплена с груди Марии-Антуанетты, это распространенный миф.",
      "Лимон тонет в воде, а лайм плавает из-за разной плотности кожуры.",
      "Во время Сухого закона врачи выписывали виски как лекарство по рецепту."
    ];
    return backups[Math.floor(Math.random() * backups.length)];
  }
};

// --- НОВАЯ СИСТЕМА ПАМЯТИ ---

// Note: The chat interface needs to change slightly for stateless requests if we aren't careful.
// However, to keep Frontend changes minimal, we can mock `chat.sendMessage` to call our stateless API.

class ProxyChat {
  private history: any[];
  private userProfile: string;

  constructor(history: any[], userProfile: string) {
    this.history = history;
    this.userProfile = userProfile;
  }

  async sendMessage(message: string) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: this.history,
        message,
        userProfile: this.userProfile,
        action: 'chat'
      })
    });

    if (!response.ok) throw new Error("Chat failed");

    const data = await response.json();
    this.history = data.history; // Update history

    return {
      response: {
        text: () => data.text
      }
    };
  }
}

export const createBarChatSession = (history: any[] = [], userProfileText: string = "") => {
  // Return a proxy object mimicking the GoogleGenAI ChatSession
  // We cannot return a real ChatSession without the SDK and API Key on client.
  return new ProxyChat(history, userProfileText);
};

export const extractUserMemory = async (history: any[]): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history,
        action: 'extract_memory'
      })
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.memory || "";
  } catch (e) {
    console.error("Memory extraction failed", e);
    return "";
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string = 'audio/webm'): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Audio, mimeType })
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("Transcription failed", error);
    return "";
  }
};

export const connectToBarLive = (callbacks: any) => {
  console.warn("Live mode is temporarily disabled in the Proxy version due to WebSocket limitations.");
  // Return a dummy object to prevent crashes if called
  return {
    send: () => { },
    disconnect: () => { },
  };
};
