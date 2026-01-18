import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCustomItem = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a unique party hosting item or outfit based on this user idea: "${prompt}". 
    CRITICAL STYLE GUIDE: The item must strictly fit a 1990s-2000s Cartoon Network aesthetic. 
    Think thick black outlines, bold saturated colors, slightly surrealist shapes, and quirky designs similar to 'Dexter's Lab', 'Powerpuff Girls', or 'Johnny Bravo'. 
    No generic 3D or modern minimalist styles. High contrast and retro-toon feel.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          color: { type: Type.STRING, description: "Hex code" },
          texture: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "type", "color", "texture", "description"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getPartyEvent = async (theme: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is hosting a "${theme}" party in a 1990s/2000s Cartoon Network world. 
    Suggest a random funny event that happens during the party that feels like a scene from a classic CN show (slapstick humor, surreal dialogue, or wacky inventions). 
    Determine how it affects the 'vibe' score (from -20 to +20).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          event: { type: Type.STRING },
          vibeImpact: { type: Type.NUMBER },
          buttonText: { type: Type.STRING }
        },
        required: ["event", "vibeImpact", "buttonText"]
      }
    }
  });

  return JSON.parse(response.text);
};