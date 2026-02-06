import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCustomItem = async (prompt: string, category: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a stylish, modern character clothing item or accessory for the slot "${category}" based on: "${prompt}". 
    
    AESTHETIC REQUIREMENTS:
    - Style: High-end streetwear, modern minimalist, or realistic casual wear.
    - Shapes: Natural draping, realistic stitching details, human-fit silhouettes.
    - Colors: Sophisticated palettes (e.g., Charcoal, Sage, Terracotta, Navy, Cream).
    - Details: Subtle textures like denim, silk, matte leather, or fine knit.
    
    TECHNICAL OUTPUT:
    Return a part type and visual properties.
    Materials: matte, hatch, metallic, plastic, gel.
    Textures: none, dots, circuit, hazmat.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, description: `Must be exactly "${category}".` },
          color: { type: Type.STRING, description: "Sophisticated Hex code." },
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

export const generateHairTexture = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a custom CSS background-image pattern for a realistic human hairstyle. 
    Theme: Modern fashion, highlights, ombre effects, or natural hair grain.
    User Prompt: "${prompt}".
    
    Return a valid CSS 'background-image' property value and a 'background-size' value.
    Use subtle gradients or micro-patterns that add depth and realism.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pattern: { type: Type.STRING, description: "A valid CSS background-image string." },
          size: { type: Type.STRING, description: "A valid CSS background-size string (e.g., '10px 10px')." },
          name: { type: Type.STRING },
        },
        required: ["pattern", "size", "name"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const synthesizeEnvironment = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Synthesize a realistic modern party environment atmosphere for: "${prompt}". 
    The style should be high-end architecture and contemporary interior design. 
    Output should include elegant decor descriptions and a professional lighting scheme.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          decor: { type: Type.STRING },
          lighting: { type: Type.STRING },
          music: { type: Type.STRING },
          effect: { type: Type.STRING, description: "A subtle atmospheric effect (e.g. Golden Hour, Warm Breeze)" }
        },
        required: ["decor", "lighting", "music", "effect"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const getPartyEvent = async (theme: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a random realistic social interaction or event occurring during a "${theme}" social gathering. Examples: A famous guest arrives, a surprise toast, a spontaneous dance-off, or a professional networking breakthrough.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          event: { type: Type.STRING },
          vibeImpact: { type: Type.NUMBER, description: "Impact between -20 and 50" },
          buttonText: { type: Type.STRING }
        },
        required: ["event", "vibeImpact", "buttonText"]
      }
    }
  });

  return JSON.parse(response.text);
};