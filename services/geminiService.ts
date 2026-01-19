import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCustomItem = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a unique character part or outfit component based on this idea: "${prompt}". 
    
    AESTHETIC REQUIREMENTS:
    - Style: 2000s Cartoon Network Era (Dexter's Lab, Powerpuff Girls, Samurai Jack, Codename: Kids Next Door).
    - Visuals: Bold black 8px ink outlines, highly geometric shapes, flat but high-saturation colors.
    - Result: Must feel like a high-quality hand-drawn asset from a classic 2000s cartoon.
    
    TECHNICAL OUTPUT:
    Return a material type and a texture pattern name. 
    Materials: matte, glossy, metallic, holographic, fuzzy, liquid.
    Textures: none, dots, stripes, grid, glitch.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, description: "Category like 'outfit', 'headwear', 'jewelry', 'accessory', 'handItem', 'hair', 'head', 'torso', 'arms', 'legs', 'eyes'." },
          color: { type: Type.STRING, description: "High-contrast Hex code (e.g., #FF00FF, #00FFFF, #8B008B)." },
          material: { type: Type.STRING },
          texture: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "type", "color", "material", "texture", "description"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getPartyEvent = async (theme: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a random funny Cartoon Network style event (2000s vibe) for a "${theme}" party. The event should feel like a plot point from a classic episode.`,
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